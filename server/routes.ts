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
  const isStandalone = process.env.STANDALONE_MODE === "true" || 
    (!process.env.REPL_ID && !process.env.ISSUER_URL);
  
  app.get("/api/health", async (_req, res) => {
    const dbStatus = await checkDatabaseConnection();
    res.json({ 
      status: dbStatus === "connected" ? "ok" : "degraded", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      standalone_mode: isStandalone,
      database: dbStatus,
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

  // Logs - returns user's logs only (client handles empty state with examples)
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

  // ==================== TRANSCRIPTS (THINKOPS BRAINDUMPS) ====================
  
  app.get("/api/transcripts", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const transcripts = await storage.getTranscripts(userId);
    res.json(transcripts);
  });

  app.get("/api/transcripts/stats", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const stats = await storage.getTranscriptStats(userId);
    res.json(stats);
  });

  app.get("/api/transcripts/:id", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const transcript = await storage.getTranscript(userId, parseInt(req.params.id));
    if (!transcript) return res.status(404).json({ error: "Transcript not found" });
    res.json(transcript);
  });

  app.post("/api/transcripts", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { title, content, fileName, sessionDate, participants } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }
    const transcript = await storage.createTranscript(userId, {
      title, content, fileName, sessionDate, participants
    });
    res.json(transcript);
  });

  app.post("/api/transcripts/:id/analyze", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const transcript = await storage.getTranscript(userId, parseInt(req.params.id));
    if (!transcript) return res.status(404).json({ error: "Transcript not found" });

    const analysisPrompt = `Analyze this brainstorming transcript and extract patterns. Return a JSON object with exactly these fields:
{
  "patterns": {
    "topics": [{"text": "theme name", "count": N, "quotes": ["direct quote 1", "quote 2"]}],
    "actions": [{"text": "action item", "count": 1, "quotes": ["context quote"]}],
    "questions": [{"text": "question raised", "count": 1, "quotes": ["full question"]}],
    "energy": [{"text": "high/medium/low", "count": 1, "quotes": ["indicator quote"]}],
    "connections": [{"text": "related project/idea", "count": N, "quotes": ["reference quote"]}]
  },
  "topThemes": [{"theme": "name", "count": N, "quotes": ["key quote"]}],
  "scorecard": {
    "totalWords": ${transcript.wordCount},
    "uniqueTopics": N,
    "actionItems": N,
    "questions": N,
    "energyLevel": "high/medium/low",
    "topTheme": "most discussed topic"
  }
}

TRANSCRIPT:
${transcript.content}`;

    const lanePrompt = `You are analyzing brainstorming transcripts for ThinkOps pattern detection.
Focus on identifying recurring themes, actionable ideas, open questions, and connections to other projects.
Be concise and extract only meaningful patterns. Limit each category to top 5 items.`;

    try {
      const aiResponse = await callAI(analysisPrompt, lanePrompt);
      
      let analysisData;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        return res.status(500).json({ error: "Failed to parse AI analysis", raw: aiResponse });
      }

      const updated = await storage.updateTranscript(userId, transcript.id, {
        patterns: analysisData.patterns,
        topThemes: analysisData.topThemes,
        scorecard: analysisData.scorecard,
        analyzed: true
      });

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Analysis failed" });
    }
  });

  app.delete("/api/transcripts/:id", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    await storage.deleteTranscript(userId, parseInt(req.params.id));
    res.json({ success: true });
  });

  // ==================== FAMILY STEWARD ====================
  
  // Family Members CRUD
  app.get("/api/family/members", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const members = await storage.getFamilyMembers(userId);
    res.json(members);
  });

  app.post("/api/family/members", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const member = await storage.createFamilyMember(userId, req.body);
    res.json(member);
  });

  app.patch("/api/family/members/:id", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const member = await storage.updateFamilyMember(userId, parseInt(req.params.id), req.body);
    res.json(member);
  });

  app.delete("/api/family/members/:id", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    await storage.deleteFamilyMember(userId, parseInt(req.params.id));
    res.json({ success: true });
  });

  // Family Drifts
  app.get("/api/family/drifts", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const active = req.query.active === "true";
    const drifts = active 
      ? await storage.getActiveFamilyDrifts(userId)
      : await storage.getFamilyDrifts(userId);
    res.json(drifts);
  });

  app.post("/api/family/drifts/:id/acknowledge", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const drift = await storage.acknowledgeFamilyDrift(userId, parseInt(req.params.id));
    res.json(drift);
  });

  app.post("/api/family/drifts/:id/resolve", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const drift = await storage.resolveFamilyDrift(userId, parseInt(req.params.id));
    res.json(drift);
  });

  // Family Stats
  app.get("/api/family/stats", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const stats = await storage.getFamilyStats(userId);
    res.json(stats);
  });

  // Family Reports
  app.get("/api/family/reports", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const reports = await storage.getFamilyReports(userId);
    res.json(reports);
  });

  app.get("/api/family/reports/latest", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const report = await storage.getLatestFamilyReport(userId);
    res.json(report || null);
  });

  // Run drift analysis on family data
  app.post("/api/family/analyze", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    
    // Gather family data
    const [members, logs, goals, checkins, weeklyReview] = await Promise.all([
      storage.getFamilyMembers(userId),
      storage.getLogs(userId),
      storage.getGoals(userId),
      storage.getCheckins(userId),
      storage.getWeeklyReview(userId)
    ]);

    const activeMembers = members.filter(m => m.active);
    const recentLogs = logs.slice(0, 14); // Last 14 days
    
    // Build context for AI analysis
    const analysisData = {
      familySize: activeMembers.length,
      memberRoles: activeMembers.map(m => ({ name: m.name, role: m.role })),
      recentLogs: recentLogs.map(l => ({
        date: l.date,
        energy: l.energy,
        mood: l.mood,
        connection: l.connection,
        topWin: l.topWin,
        topFriction: l.topFriction
      })),
      weeklyStats: weeklyReview.stats,
      existingDriftFlags: weeklyReview.driftFlags,
      goals: goals.filter(g => g.status === 'active').map(g => ({ domain: g.domain, title: g.title }))
    };

    const analysisPrompt = `Analyze this family system data and detect drifts. Return a JSON object with:
{
  "drifts": [
    {
      "driftType": "low_energy|missed_checkins|pattern_break|domain_neglect|overload|connection_gap",
      "severity": "low|medium|high",
      "sentence": "Factual observation (no speculation)",
      "context": { "dataPoints": ["specific data"], "timeframe": "date range", "triggers": ["potential causes"] },
      "suggestions": [
        { "activity": "Bond-strengthening activity", "rationale": "Why this helps", "effort": "low|medium|high" }
      ]
    }
  ],
  "weekSummary": "One paragraph factual summary of family patterns this week",
  "topPriority": "Single most important thing to address"
}

DATA:
${JSON.stringify(analysisData, null, 2)}`;

    const lanePrompt = `You are the Family Steward AI for BruceOps. 
Your role is to detect drifts (patterns requiring attention) in family systems.
RULES:
- Only state FACTUAL observations based on the data provided
- Never speculate about emotions or motivations you can't observe
- Suggestions should be practical, bond-strengthening activities
- Focus on patterns that could be addressed with simple family activities
- Consider completion rates: if <40%, suggest family walks or simple shared activities`;

    try {
      const aiResponse = await callAI(analysisPrompt, lanePrompt);
      
      let analysisResult;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        return res.status(500).json({ error: "Failed to parse AI analysis", raw: aiResponse });
      }

      // Create drift records for each detected drift
      const createdDrifts = [];
      for (const drift of analysisResult.drifts || []) {
        const created = await storage.createFamilyDrift(userId, {
          driftType: drift.driftType,
          severity: drift.severity,
          sentence: drift.sentence,
          context: drift.context,
          suggestions: drift.suggestions,
          memberId: null // family-wide drift
        });
        createdDrifts.push(created);
      }

      res.json({
        drifts: createdDrifts,
        summary: analysisResult.weekSummary,
        topPriority: analysisResult.topPriority,
        analyzedAt: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Analysis failed" });
    }
  });

  // Generate weekly family report
  app.post("/api/family/reports/generate", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekStart = weekAgo.toISOString().split('T')[0];
    const weekEnd = today.toISOString().split('T')[0];

    // Gather data for report
    const [members, drifts, weeklyReview, logs] = await Promise.all([
      storage.getFamilyMembers(userId),
      storage.getFamilyDrifts(userId),
      storage.getWeeklyReview(userId),
      storage.getLogs(userId)
    ]);

    const weekDrifts = drifts.filter(d => {
      const detectedDate = d.detectedAt?.toISOString().split('T')[0];
      return detectedDate && detectedDate >= weekStart && detectedDate <= weekEnd;
    });

    const recentLogs = logs.filter(l => l.date >= weekStart && l.date <= weekEnd);
    const avgEnergy = recentLogs.length > 0 
      ? Math.round(recentLogs.reduce((sum, l) => sum + (l.energy || 0), 0) / recentLogs.length)
      : 0;
    const avgConnection = recentLogs.length > 0
      ? Math.round(recentLogs.reduce((sum, l) => sum + (l.connection || 0), 0) / recentLogs.length)
      : 0;

    const reportPrompt = `Generate a weekly family report summary. Return JSON:
{
  "summary": "2-3 sentence factual summary of the family's week",
  "highlights": [
    { "category": "win|challenge|pattern", "text": "observation", "sentiment": "positive|neutral|needs-attention" }
  ],
  "suggestedActivities": [
    { "activity": "Specific activity", "rationale": "Why now", "effort": "low|medium|high" }
  ]
}

DATA:
- Week: ${weekStart} to ${weekEnd}
- Family members: ${members.filter(m => m.active).length}
- Completion rate: ${weeklyReview.stats.completionRate}%
- Average energy: ${avgEnergy}/10
- Average connection: ${avgConnection}/10
- Drifts detected: ${weekDrifts.length}
- Drift types: ${Array.from(new Set(weekDrifts.map(d => d.driftType))).join(', ') || 'none'}`;

    try {
      const aiResponse = await callAI(reportPrompt, `You are generating a factual weekly family report. Be encouraging but honest. Focus on patterns, not judgments.`);
      
      let reportData;
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reportData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch (parseError) {
        return res.status(500).json({ error: "Failed to parse report", raw: aiResponse });
      }

      const report = await storage.createFamilyReport(userId, {
        weekStart,
        weekEnd,
        summary: reportData.summary,
        highlights: reportData.highlights,
        driftsDetected: weekDrifts,
        suggestedActivities: reportData.suggestedActivities,
        stats: {
          completionRate: weeklyReview.stats.completionRate,
          avgEnergy,
          avgConnection,
          driftsCount: weekDrifts.length
        }
      });

      res.json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Report generation failed" });
    }
  });

  // ==================== DATA EXPORT ====================
  
  app.get("/api/export/data", isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    
    const [logs, ideas, goals, checkins, teaching, harris, settings, transcripts, familyMembers, familyDrifts, familyReports] = await Promise.all([
      storage.getLogs(userId),
      storage.getIdeas(userId),
      storage.getGoals(userId),
      storage.getCheckins(userId),
      storage.getTeachingRequests(userId),
      storage.getHarrisContent(userId),
      storage.getSettings(),
      storage.getTranscripts(userId),
      storage.getFamilyMembers(userId),
      storage.getFamilyDrifts(userId),
      storage.getFamilyReports(userId),
    ]);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      version: "1.1.0",
      data: {
        logs,
        ideas,
        goals,
        checkins,
        teachingRequests: teaching,
        harrisContent: harris,
        transcripts,
        settings,
        family: {
          members: familyMembers,
          drifts: familyDrifts,
          reports: familyReports
        }
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="bruceops-export.json"');
    res.json(exportData);
  });

  // ==================== GOOGLE DRIVE ====================
  // Disabled in standalone mode (requires Replit connector)
  
  const driveDisabledResponse = { 
    error: "Google Drive sync is not available in standalone mode",
    standalone_mode: true,
    suggestion: "Use the data export feature (/api/export/data) for backups"
  };

  // List files from Google Drive
  app.get("/api/drive/files", isAuthenticated, async (req, res) => {
    if (isStandalone) {
      return res.status(503).json(driveDisabledResponse);
    }
    try {
      const { listDriveFiles } = await import("./google-drive");
      const query = req.query.q as string | undefined;
      const files = await listDriveFiles(query);
      res.json({ files });
    } catch (error: any) {
      console.error("Google Drive list error:", error);
      res.status(500).json({ error: error.message || "Failed to list files" });
    }
  });

  // Upload file to Google Drive
  app.post("/api/drive/upload", isAuthenticated, async (req, res) => {
    if (isStandalone) {
      return res.status(503).json(driveDisabledResponse);
    }
    try {
      const { uploadToDrive } = await import("./google-drive");
      const { name, content, mimeType } = req.body;
      if (!name || !content) {
        return res.status(400).json({ error: "Name and content are required" });
      }
      const file = await uploadToDrive(name, content, mimeType);
      res.json({ file });
    } catch (error: any) {
      console.error("Google Drive upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });

  // Download file from Google Drive
  app.get("/api/drive/download/:fileId", isAuthenticated, async (req, res) => {
    if (isStandalone) {
      return res.status(503).json(driveDisabledResponse);
    }
    try {
      const { downloadFromDrive } = await import("./google-drive");
      const content = await downloadFromDrive(req.params.fileId);
      res.json({ content });
    } catch (error: any) {
      console.error("Google Drive download error:", error);
      res.status(500).json({ error: error.message || "Failed to download file" });
    }
  });

  // Create folder in Google Drive
  app.post("/api/drive/folder", isAuthenticated, async (req, res) => {
    if (isStandalone) {
      return res.status(503).json(driveDisabledResponse);
    }
    try {
      const { createDriveFolder } = await import("./google-drive");
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Folder name is required" });
      }
      const folder = await createDriveFolder(name);
      res.json({ folder });
    } catch (error: any) {
      console.error("Google Drive folder error:", error);
      res.status(500).json({ error: error.message || "Failed to create folder" });
    }
  });

  return httpServer;
}
