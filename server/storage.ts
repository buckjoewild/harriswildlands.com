import { db } from "./db";
import {
  logs, ideas, teachingRequests, harrisContent, settings,
  type InsertLog, type InsertIdea, type InsertTeachingRequest, type InsertHarrisContent,
  type Log, type Idea, type TeachingRequest, type HarrisContent, type Setting
} from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Logs (user-scoped)
  getLogs(userId: string): Promise<Log[]>;
  createLog(userId: string, log: InsertLog): Promise<Log>;
  getLogByDate(userId: string, date: string): Promise<Log | undefined>;
  updateLogSummary(userId: string, id: number, summary: string): Promise<Log>;
  
  // Ideas (user-scoped)
  getIdeas(userId: string): Promise<Idea[]>;
  getIdea(userId: string, id: number): Promise<Idea | undefined>;
  createIdea(userId: string, idea: InsertIdea): Promise<Idea>;
  updateIdea(userId: string, id: number, updates: Partial<Idea>): Promise<Idea>;
  
  // Teaching (user-scoped)
  getTeachingRequests(userId: string): Promise<TeachingRequest[]>;
  getTeachingRequest(userId: string, id: number): Promise<TeachingRequest | undefined>;
  createTeachingRequest(userId: string, req: InsertTeachingRequest, output: any): Promise<TeachingRequest>;
  
  // Harris (user-scoped)
  getHarrisContent(userId: string): Promise<HarrisContent[]>;
  createHarrisContent(userId: string, content: InsertHarrisContent, generatedCopy: any): Promise<HarrisContent>;
  
  // Settings (global for now)
  getSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: string): Promise<Setting>;
  
  // Dashboard (user-scoped)
  getDashboardStats(userId: string): Promise<{ logsToday: number; openLoops: number }>;
}

export class DatabaseStorage implements IStorage {
  // -------------------- LOGS (USER-SCOPED) --------------------
  
  async getLogs(userId: string): Promise<Log[]> {
    return await db.select().from(logs)
      .where(eq(logs.userId, userId))
      .orderBy(desc(logs.date));
  }

  async createLog(userId: string, log: InsertLog): Promise<Log> {
    const [newLog] = await db.insert(logs).values({ ...log, userId }).returning();
    return newLog;
  }

  async getLogByDate(userId: string, date: string): Promise<Log | undefined> {
    const [log] = await db.select().from(logs)
      .where(and(eq(logs.userId, userId), eq(logs.date, date)));
    return log;
  }

  async updateLogSummary(userId: string, id: number, summary: string): Promise<Log> {
    const [updated] = await db.update(logs)
      .set({ aiSummary: summary })
      .where(and(eq(logs.id, id), eq(logs.userId, userId)))
      .returning();
    return updated;
  }

  // -------------------- IDEAS (USER-SCOPED) --------------------
  
  async getIdeas(userId: string): Promise<Idea[]> {
    return await db.select().from(ideas)
      .where(eq(ideas.userId, userId))
      .orderBy(desc(ideas.createdAt));
  }

  async getIdea(userId: string, id: number): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas)
      .where(and(eq(ideas.id, id), eq(ideas.userId, userId)));
    return idea;
  }

  async createIdea(userId: string, idea: InsertIdea): Promise<Idea> {
    const [newIdea] = await db.insert(ideas).values({ ...idea, userId }).returning();
    return newIdea;
  }

  async updateIdea(userId: string, id: number, updates: Partial<Idea>): Promise<Idea> {
    // Defensive: strip userId from updates to prevent ownership change
    const { userId: _, ...safeUpdates } = updates as any;
    const [updated] = await db.update(ideas)
      .set(safeUpdates)
      .where(and(eq(ideas.id, id), eq(ideas.userId, userId)))
      .returning();
    return updated;
  }

  // -------------------- TEACHING (USER-SCOPED) --------------------
  
  async getTeachingRequests(userId: string): Promise<TeachingRequest[]> {
    return await db.select().from(teachingRequests)
      .where(eq(teachingRequests.userId, userId))
      .orderBy(desc(teachingRequests.createdAt));
  }

  async getTeachingRequest(userId: string, id: number): Promise<TeachingRequest | undefined> {
    const [req] = await db.select().from(teachingRequests)
      .where(and(eq(teachingRequests.id, id), eq(teachingRequests.userId, userId)));
    return req;
  }

  async createTeachingRequest(userId: string, req: InsertTeachingRequest, output: any): Promise<TeachingRequest> {
    const [newReq] = await db.insert(teachingRequests)
      .values({ ...req, userId, output })
      .returning();
    return newReq;
  }

  // -------------------- HARRIS (USER-SCOPED) --------------------
  
  async getHarrisContent(userId: string): Promise<HarrisContent[]> {
    return await db.select().from(harrisContent)
      .where(eq(harrisContent.userId, userId))
      .orderBy(desc(harrisContent.createdAt));
  }

  async createHarrisContent(userId: string, content: InsertHarrisContent, generatedCopy: any): Promise<HarrisContent> {
    const [newContent] = await db.insert(harrisContent)
      .values({ ...content, userId, generatedCopy })
      .returning();
    return newContent;
  }

  // -------------------- SETTINGS --------------------
  
  async getSettings(): Promise<Setting[]> {
    return await db.select().from(settings);
  }

  async updateSetting(key: string, value: string): Promise<Setting> {
    const [updated] = await db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value }
      })
      .returning();
    return updated;
  }

  // -------------------- DASHBOARD (USER-SCOPED) --------------------
  
  async getDashboardStats(userId: string): Promise<{ logsToday: number; openLoops: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    const logsToday = await db.select({ count: sql<number>`count(*)` })
      .from(logs)
      .where(and(eq(logs.userId, userId), eq(logs.date, today)));
      
    const loops = await db.select({ count: sql<number>`count(*)` })
      .from(ideas)
      .where(and(eq(ideas.userId, userId), eq(ideas.status, 'draft')));

    return {
      logsToday: Number(logsToday[0]?.count || 0),
      openLoops: Number(loops[0]?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
