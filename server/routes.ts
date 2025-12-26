import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";

// AI Provider Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || "off";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Determine active AI provider based on configuration and available keys
function getActiveAIProvider(): "gemini" | "openrouter" | "off" {
  if (AI_PROVIDER === "off") return "off";
  if (AI_PROVIDER === "gemini" && GOOGLE_GEMINI_API_KEY) return "gemini";
  if (AI_PROVIDER === "openrouter" && OPENROUTER_API_KEY) return "openrouter";
  // Fallback ladder: try gemini first, then openrouter
  if (GOOGLE_GEMINI_API_KEY) return "gemini";
  if (OPENROUTER_API_KEY) return "openrouter";
  return "off";
}

const activeProvider = getActiveAIProvider();
console.log(`AI Provider: ${activeProvider} (configured: ${AI_PROVIDER})`);

// Global developer prompt that addresses Bruce directly
const BRUCE_CONTEXT = `You are speaking directly to Bruce Harris - a dad, 5th/6th grade teacher, creator, and builder.
Bruce is building his personal operating system called BruceOps to manage his life, ideas, teaching, and creative work.
Always address him as "Bruce" and speak with the directness of a trusted advisor who knows his goals.
Be practical, honest, and help him stay aligned with his values: faith, family, building things that matter.`;

// Helper to get userId from authenticated request
function getUserId(req: Request): string {
  return (req.user as any)?.claims?.sub;
}

// Gemini API call
async function callGemini(prompt: string, systemPrompt: string): Promise<string> {
  if (!GOOGLE_GEMINI_API_KEY) throw new Error("Gemini API key not available");
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
      })
    }
  );
  
  const data = await response.json();
  if (!response.ok) throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// OpenRouter API call
async function callOpenRouterAPI(prompt: string, systemPrompt: string): Promise<string> {
  if (!OPENROUTER_API_KEY) throw new Error("OpenRouter API key not available");
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`OpenRouter API error: ${JSON.stringify(data)}`);
  return data.choices[0].message.content;
}

// AI Provider Ladder: Gemini -> OpenRouter -> Off
async function callAI(prompt: string, lanePrompt: string = ""): Promise<string> {
  const systemPrompt = `${BRUCE_CONTEXT}\n\n${lanePrompt}`.trim();
  const provider = getActiveAIProvider();
  
  if (provider === "off") {
    return "AI features are currently disabled. Daily logging works normally.";
  }
  
  // Try primary provider
  try {
    if (provider === "gemini") {
      return await callGemini(prompt, systemPrompt);
    } else if (provider === "openrouter") {
      return await callOpenRouterAPI(prompt, systemPrompt);
    }
  } catch (primaryError) {
    console.error(`Primary AI provider (${provider}) failed:`, primaryError);
    
    // Fallback to secondary provider
    try {
      if (provider === "gemini" && OPENROUTER_API_KEY) {
        console.log("Falling back to OpenRouter...");
        return await callOpenRouterAPI(prompt, systemPrompt);
      } else if (provider === "openrouter" && GOOGLE_GEMINI_API_KEY) {
        console.log("Falling back to Gemini...");
        return await callGemini(prompt, systemPrompt);
      }
    } catch (fallbackError) {
      console.error("Fallback AI provider also failed:", fallbackError);
    }
  }
  
  return "AI insights unavailable. Daily logging completed successfully.";
}

// Check database connectivity
async function checkDatabaseConnection(): Promise<"connected" | "error"> {
  try {
    await db.execute(sql`SELECT 1`);
    return "connected";
  } catch (error) {
    console.error("Database connection check failed:", error);
    return "error";
  }
}

// Get AI status
function getAIStatus(): "active" | "degraded" | "offline" {
  const provider = getActiveAIProvider();
  if (provider === "off") return "offline";
  if (provider === "gemini" && GOOGLE_GEMINI_API_KEY) return "active";
  if (provider === "openrouter" && OPENROUTER_API_KEY) return "active";
  return "degraded";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== HEALTH CHECK (NO AUTH) ====================
  app.get("/api/health", async (_req, res) => {
    const dbStatus = await checkDatabaseConnection();
    res.json({ 
      status: dbStatus === "connected" ? "ok" : "degraded", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
      demo_mode: false,
      ai_provider: getActiveAIProvider(),
      ai_status: getAIStatus()
    });
  });

  // Setup Replit Auth BEFORE all other routes
  await setupAuth(app);
  registerAuthRoutes(app);

  // /api/me endpoint for frontend to get current user info
  app.get("/api/me", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    res.json({ id: userId, claims: (req.user as any)?.claims });
  });

  // ==================== ALL ROUTES BELOW REQUIRE AUTH ====================

  // Dashboard
  app.get(api.dashboard.get.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const stats = await storage.getDashboardStats(userId);
    const driftFlags = ["Sleep consistency < 70%", "High stress pattern detected"]; 
    res.json({ ...stats, driftFlags });
  });

  // Logs
  app.get(api.logs.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const logs = await storage.getLogs(userId);
    res.json(logs);
  });

  // Get log by date (for duplicate detection)
  app.get("/api/logs/:date", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { date } = req.params;
    const log = await storage.getLogByDate(userId, date);
    if (!log) {
      return res.status(404).json({ message: "No log found for this date" });
    }
    res.json(log);
  });

  app.post(api.logs.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog(userId, input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Update existing log
  app.put("/api/logs/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const id = Number(req.params.id);
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.updateLog(userId, id, input);
      if (!log) {
        return res.status(404).json({ message: "Log not found" });
      }
      res.json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.logs.generateSummary.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { date } = req.body;
    const log = await storage.getLogByDate(userId, date);
    if (!log) return res.status(404).json({ message: "Log not found" });

    const prompt = `Generate a factual summary for this daily log. Avoid advice. Identify pattern signals.
    Log Data: ${JSON.stringify(log)}`;
    
    const summary = await callAI(prompt, "You are a Life Operations Steward. Output factual/pattern-based summaries only.");
    
    const updated = await storage.updateLogSummary(userId, log.id, summary);
    res.json({ summary: updated.aiSummary });
  });

  // Ideas
  app.get(api.ideas.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const ideas = await storage.getIdeas(userId);
    res.json(ideas);
  });

  app.post(api.ideas.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.ideas.create.input.parse(req.body);
      const idea = await storage.createIdea(userId, input);
      res.status(201).json(idea);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.ideas.update.path, isAuthenticated, async (req, res) => {
     const userId = getUserId(req);
     const id = Number(req.params.id);
     // Strip userId from payload to prevent authorization bypass
     const { userId: _, ...updates } = req.body;
     const updated = await storage.updateIdea(userId, id, updates);
     res.json(updated);
  });

  app.post(api.ideas.runRealityCheck.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const idea = await storage.getIdea(userId, id);
    if (!idea) return res.status(404).json({ message: "Idea not found" });

    const prompt = `Perform a Reality Check on this idea. 
    Separate into Known, Likely, Speculation. 
    Flag self-deception (Overbuilding, Perfectionism, etc).
    Suggest a decision bin (Discard, Park, Salvage, Promote).
    
    Idea: ${JSON.stringify(idea)}
    
    Return pure JSON format: { "known": [], "likely": [], "speculation": [], "flags": [], "decision": "" }`;

    const response = await callAI(prompt, "You are a ruthless but helpful product manager. JSON output only.");
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const realityCheck = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response", raw: response };

    const updated = await storage.updateIdea(userId, id, { realityCheck, status: "reality_checked" });
    res.json(updated);
  });

  // Teaching
  app.get(api.teaching.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const reqs = await storage.getTeachingRequests(userId);
    res.json(reqs);
  });

  app.post(api.teaching.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.teaching.create.input.parse(req.body);
      
      const prompt = `You are Bruce, a 5th-6th grade teaching assistant.
      Input: ${JSON.stringify(input)}
      Build: (1) lesson outline, (2) hands-on activity, (3) exit ticket + key, (4) differentiation, (5) 10-min prep list.
      Return JSON format.`;
      
      const response = await callAI(prompt, "You are a strict standards-aligned teaching assistant. JSON output only.");
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const output = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };

      const newReq = await storage.createTeachingRequest(userId, input, output);
      res.status(201).json(newReq);
    } catch (err) {
      console.log(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Harris
  app.post(api.harris.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.harris.create.input.parse(req.body);
      
      const prompt = `Write conversion-focused website copy for HarrisWildlands.com.
      Core Message: ${JSON.stringify(input.coreMessage)}
      Site Map: ${JSON.stringify(input.siteMap)}
      Lead Magnet: ${JSON.stringify(input.leadMagnet)}
      
      Output JSON with keys: home, startHere, resources. Keep it simple and honest.`;
      
      const response = await callAI(prompt, "You are a copywriter for a dad/teacher audience. No hype. JSON output only.");
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const generatedCopy = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };

      const content = await storage.createHarrisContent(userId, input, generatedCopy);
      res.status(201).json(content);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings
  app.get(api.settings.list.path, isAuthenticated, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, isAuthenticated, async (req, res) => {
    const key = req.params.key;
    const { value } = req.body;
    const updated = await storage.updateSetting(key, value);
    res.json(updated);
  });

  // ==================== GOALS ====================
  
  app.get(api.goals.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const goals = await storage.getGoals(userId);
    res.json(goals);
  });

  app.post(api.goals.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.goals.create.input.parse(req.body);
      const goal = await storage.createGoal(userId, input);
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.goals.update.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    const { userId: _, ...updates } = req.body;
    const updated = await storage.updateGoal(userId, id, updates);
    if (!updated) return res.status(404).json({ message: "Goal not found" });
    res.json(updated);
  });

  // ==================== CHECKINS ====================
  
  app.get(api.checkins.list.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const checkins = await storage.getCheckins(userId, startDate, endDate);
    res.json(checkins);
  });

  app.post(api.checkins.upsert.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const input = api.checkins.upsert.input.parse(req.body);
      const checkin = await storage.upsertCheckin(userId, input.goalId, input.date, input.done, input.score, input.note);
      res.json(checkin);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.checkins.batch.path, isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const inputs = api.checkins.batch.input.parse(req.body);
      const results = await Promise.all(
        inputs.map(input => 
          storage.upsertCheckin(userId, input.goalId, input.date, input.done, input.score, input.note)
        )
      );
      res.json(results);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // ==================== WEEKLY REVIEW ====================
  
  app.get(api.weeklyReview.get.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const review = await storage.getWeeklyReview(userId);
    res.json(review);
  });

  app.get(api.weeklyReview.exportPdf.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const review = await storage.getWeeklyReview(userId);
    
    const pdfContent = `
WEEKLY GOAL REVIEW
==================
Period: ${review.stats.startDate} to ${review.stats.endDate}

SUMMARY
-------
Completion Rate: ${review.stats.completionRate}%
Total Check-ins: ${review.stats.totalCheckins}
Completed: ${review.stats.completedCheckins}

GOALS
-----
${review.goals.map(g => `- [${g.domain.toUpperCase()}] ${g.title} (Priority: ${g.priority})`).join('\n')}

DOMAIN COVERAGE
---------------
${Object.entries(review.stats.domainStats || {}).map(([domain, stats]: [string, any]) => 
  `${domain}: ${stats.checkins}/${stats.goals * 7} check-ins`
).join('\n')}

DRIFT FLAGS
-----------
${review.driftFlags.length > 0 ? review.driftFlags.map(f => `- ${f}`).join('\n') : 'No drift flags this week.'}
`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="weekly-review.txt"');
    res.send(pdfContent);
  });

  // ==================== DATA EXPORT ====================
  
  app.get("/api/export/data", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    
    const [logs, ideas, goals, checkins, teaching, harris, settings] = await Promise.all([
      storage.getLogs(userId),
      storage.getIdeas(userId),
      storage.getGoals(userId),
      storage.getCheckins(userId),
      storage.getTeachingRequests(userId),
      storage.getHarrisContent(userId),
      storage.getSettings(),
    ]);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.0.0",
      data: {
        logs,
        ideas,
        goals,
        checkins,
        teachingRequests: teaching,
        harrisContent: harris,
        settings
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="bruceops-export.json"');
    res.json(exportData);
  });

  return httpServer;
}
