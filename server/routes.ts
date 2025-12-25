import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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
        model: "openai/gpt-4o-mini", // Cost effective
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

  // Dashboard
  app.get(api.dashboard.get.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    // Mock drift flags for now as per requirements until enough data
    const driftFlags = ["Sleep consistency < 70%", "High stress pattern detected"]; 
    res.json({ ...stats, driftFlags });
  });

  // Logs
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.post(api.logs.create.path, async (req, res) => {
    try {
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.post(api.logs.generateSummary.path, async (req, res) => {
    const { date } = req.body;
    const log = await storage.getLogByDate(date);
    if (!log) return res.status(404).json({ message: "Log not found" });

    const prompt = `Generate a factual summary for this daily log. Avoid advice. Identify pattern signals.
    Log Data: ${JSON.stringify(log)}`;
    
    const summary = await callOpenRouter(prompt, "You are a Life Operations Steward. Output factual/pattern-based summaries only.");
    
    const updated = await storage.updateLogSummary(log.id, summary);
    res.json({ summary: updated.aiSummary });
  });

  // Ideas
  app.get(api.ideas.list.path, async (req, res) => {
    const ideas = await storage.getIdeas();
    res.json(ideas);
  });

  app.post(api.ideas.create.path, async (req, res) => {
    try {
      const input = api.ideas.create.input.parse(req.body);
      const idea = await storage.createIdea(input);
      res.status(201).json(idea);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.ideas.update.path, async (req, res) => {
     const id = Number(req.params.id);
     const updated = await storage.updateIdea(id, req.body);
     res.json(updated);
  });

  app.post(api.ideas.runRealityCheck.path, async (req, res) => {
    const id = Number(req.params.id);
    const idea = await storage.getIdea(id);
    if (!idea) return res.status(404).json({ message: "Idea not found" });

    const prompt = `Perform a Reality Check on this idea. 
    Separate into Known, Likely, Speculation. 
    Flag self-deception (Overbuilding, Perfectionism, etc).
    Suggest a decision bin (Discard, Park, Salvage, Promote).
    
    Idea: ${JSON.stringify(idea)}
    
    Return pure JSON format: { "known": [], "likely": [], "speculation": [], "flags": [], "decision": "" }`;

    const response = await callOpenRouter(prompt, "You are a ruthless but helpful product manager. JSON output only.");
    
    // Naive JSON extraction
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const realityCheck = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response", raw: response };

    const updated = await storage.updateIdea(id, { realityCheck, status: "reality_checked" });
    res.json(updated);
  });

  // Teaching
  app.get(api.teaching.list.path, async (req, res) => {
    const reqs = await storage.getTeachingRequests();
    res.json(reqs);
  });

  app.post(api.teaching.create.path, async (req, res) => {
    try {
      const input = api.teaching.create.input.parse(req.body);
      
      const prompt = `You are Bruce, a 5th-6th grade teaching assistant.
      Input: ${JSON.stringify(input)}
      Build: (1) lesson outline, (2) hands-on activity, (3) exit ticket + key, (4) differentiation, (5) 10-min prep list.
      Return JSON format.`;
      
      const response = await callOpenRouter(prompt, "You are a strict standards-aligned teaching assistant. JSON output only.");
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const output = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };

      const newReq = await storage.createTeachingRequest(input, output);
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
  app.post(api.harris.create.path, async (req, res) => {
    try {
      const input = api.harris.create.input.parse(req.body);
      
      const prompt = `Write conversion-focused website copy for HarrisWildlands.com.
      Core Message: ${JSON.stringify(input.coreMessage)}
      Site Map: ${JSON.stringify(input.siteMap)}
      Lead Magnet: ${JSON.stringify(input.leadMagnet)}
      
      Output JSON with keys: home, startHere, resources. Keep it simple and honest.`;
      
      const response = await callOpenRouter(prompt, "You are a copywriter for a dad/teacher audience. No hype. JSON output only.");
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const generatedCopy = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };

      const content = await storage.createHarrisContent(input, generatedCopy);
      res.status(201).json(content);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings
  app.get(api.settings.list.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, async (req, res) => {
    const key = req.params.key;
    const { value } = req.body;
    const updated = await storage.updateSetting(key, value);
    res.json(updated);
  });

  return httpServer;
}
