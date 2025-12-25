import { db } from "./db";
import {
  logs, ideas, teachingRequests, harrisContent, settings,
  type InsertLog, type InsertIdea, type InsertTeachingRequest, type InsertHarrisContent,
  type Log, type Idea, type TeachingRequest, type HarrisContent, type Setting
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Logs
  getLogs(): Promise<Log[]>;
  createLog(log: InsertLog): Promise<Log>;
  getLogByDate(date: string): Promise<Log | undefined>;
  updateLogSummary(id: number, summary: string): Promise<Log>;
  
  // Ideas
  getIdeas(): Promise<Idea[]>;
  getIdea(id: number): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: number, updates: Partial<Idea>): Promise<Idea>;
  
  // Teaching
  getTeachingRequests(): Promise<TeachingRequest[]>;
  createTeachingRequest(req: InsertTeachingRequest, output: any): Promise<TeachingRequest>;
  
  // Harris
  getHarrisContent(): Promise<HarrisContent[]>;
  createHarrisContent(content: InsertHarrisContent, generatedCopy: any): Promise<HarrisContent>;
  
  // Settings
  getSettings(): Promise<Setting[]>;
  updateSetting(key: string, value: string): Promise<Setting>;
  
  // Dashboard
  getDashboardStats(): Promise<{ logsToday: number; openLoops: number }>;
}

export class DatabaseStorage implements IStorage {
  async getLogs(): Promise<Log[]> {
    return await db.select().from(logs).orderBy(desc(logs.date));
  }

  async createLog(log: InsertLog): Promise<Log> {
    const [newLog] = await db.insert(logs).values(log).returning();
    return newLog;
  }

  async getLogByDate(date: string): Promise<Log | undefined> {
    const [log] = await db.select().from(logs).where(eq(logs.date, date));
    return log;
  }

  async updateLogSummary(id: number, summary: string): Promise<Log> {
    const [updated] = await db.update(logs)
      .set({ aiSummary: summary })
      .where(eq(logs.id, id))
      .returning();
    return updated;
  }

  async getIdeas(): Promise<Idea[]> {
    return await db.select().from(ideas).orderBy(desc(ideas.createdAt));
  }

  async getIdea(id: number): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea;
  }

  async createIdea(idea: InsertIdea): Promise<Idea> {
    const [newIdea] = await db.insert(ideas).values(idea).returning();
    return newIdea;
  }

  async updateIdea(id: number, updates: Partial<Idea>): Promise<Idea> {
    const [updated] = await db.update(ideas)
      .set(updates)
      .where(eq(ideas.id, id))
      .returning();
    return updated;
  }

  async getTeachingRequests(): Promise<TeachingRequest[]> {
    return await db.select().from(teachingRequests).orderBy(desc(teachingRequests.createdAt));
  }

  async createTeachingRequest(req: InsertTeachingRequest, output: any): Promise<TeachingRequest> {
    const [newReq] = await db.insert(teachingRequests)
      .values({ ...req, output })
      .returning();
    return newReq;
  }

  async getHarrisContent(): Promise<HarrisContent[]> {
    return await db.select().from(harrisContent).orderBy(desc(harrisContent.createdAt));
  }

  async createHarrisContent(content: InsertHarrisContent, generatedCopy: any): Promise<HarrisContent> {
    const [newContent] = await db.insert(harrisContent)
      .values({ ...content, generatedCopy })
      .returning();
    return newContent;
  }

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

  async getDashboardStats(): Promise<{ logsToday: number; openLoops: number }> {
    const today = new Date().toISOString().split('T')[0];
    const logsToday = await db.select({ count: sql<number>`count(*)` })
      .from(logs)
      .where(eq(logs.date, today));
      
    // Simplified open loops count (e.g. ideas in 'draft' or 'parked')
    const loops = await db.select({ count: sql<number>`count(*)` })
      .from(ideas)
      .where(eq(ideas.status, 'draft'));

    return {
      logsToday: Number(logsToday[0]?.count || 0),
      openLoops: Number(loops[0]?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
