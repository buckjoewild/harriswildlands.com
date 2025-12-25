import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Helper to get userId from authenticated request
function getUserId(req: Request): string {
  return (req.user as any)?.claims?.sub;
}

async function callOpenRouter(prompt: string, systemPrompt: string = "You are a helpful assistant.") {
  if (!OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY not set, returning mock response");
    return "AI generation unavailable. Please set OPENROUTER_API_KEY.";
  }

  try {
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
    if (!response.ok) {
       console.error("OpenRouter API error:", data);
       throw new Error(`OpenRouter API error: ${JSON.stringify(data)}`);
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI Call failed:", error);
    return "Error generating AI response.";
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

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

  app.post(api.logs.generateSummary.path, isAuthenticated, async (req, res) => {
    const userId = getUserId(req);
    const { date } = req.body;
    const log = await storage.getLogByDate(userId, date);
    if (!log) return res.status(404).json({ message: "Log not found" });

    const prompt = `Generate a factual summary for this daily log. Avoid advice. Identify pattern signals.
    Log Data: ${JSON.stringify(log)}`;
    
    const summary = await callOpenRouter(prompt, "You are a Life Operations Steward. Output factual/pattern-based summaries only.");
    
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

    const response = await callOpenRouter(prompt, "You are a ruthless but helpful product manager. JSON output only.");
    
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
      
      const response = await callOpenRouter(prompt, "You are a strict standards-aligned teaching assistant. JSON output only.");
      
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
      
      const response = await callOpenRouter(prompt, "You are a copywriter for a dad/teacher audience. No hype. JSON output only.");
      
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

  return httpServer;
}
