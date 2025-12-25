import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Lane 1: LifeOps
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  sleepHours: integer("sleep_hours"),
  energy: integer("energy"), // 1-10
  stress: integer("stress"), // 1-10
  mood: integer("mood"), // 1-10
  vaping: boolean("vaping").default(false),
  exercise: boolean("exercise").default(false),
  familyConnection: text("family_connection"),
  topWin: text("top_win"),
  topFriction: text("top_friction"),
  tomorrowPriority: text("tomorrow_priority"),
  faithAlignment: text("faith_alignment"),
  moneyPressure: integer("money_pressure"), // 1-10
  driftCheck: text("drift_check"), // "what is pulling me off course?"
  rawTranscript: text("raw_transcript"), // For voice logs if needed later
  aiSummary: text("ai_summary"), // The generated factual summary
  createdAt: timestamp("created_at").defaultNow(),
});

// Lane 2: ThinkOps
export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  pitch: text("pitch"),
  whoItHelps: text("who_it_helps"),
  painItSolves: text("pain_it_solves"),
  whyICare: text("why_i_care"),
  tinyTest: text("tiny_test"), // <= 7 days
  status: text("status").default("draft"), // draft, parked, promoted, discarded
  realityCheck: jsonb("reality_check"), // { known: [], likely: [], speculation: [], flags: [], decision: "" }
  promotedSpec: jsonb("promoted_spec"), // { build: "", verify: "", ship: "" }
  createdAt: timestamp("created_at").defaultNow(),
});

// Lane 3: Bruce Teaching Assistant
export const teachingRequests = pgTable("teaching_requests", {
  id: serial("id").primaryKey(),
  grade: text("grade"),
  standard: text("standard"),
  topic: text("topic"),
  timeBlock: text("time_block"),
  materials: text("materials"),
  studentProfile: text("student_profile"),
  constraints: text("constraints"),
  assessmentType: text("assessment_type"),
  format: text("format"),
  output: jsonb("output"), // The full Bruce output package
  createdAt: timestamp("created_at").defaultNow(),
});

// Lane 4: HarrisWildlands
export const harrisContent = pgTable("harris_content", {
  id: serial("id").primaryKey(),
  coreMessage: jsonb("core_message"), // { definition, audience, pain, promise }
  siteMap: jsonb("site_map"), // { homeGoal, startHereGoal, resourcesGoal, cta }
  leadMagnet: jsonb("lead_magnet"), // { title, problem, timeToValue, delivery }
  generatedCopy: jsonb("generated_copy"), // { home: "", startHere: "", resources: "" }
  createdAt: timestamp("created_at").defaultNow(),
});

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(), // model, tone, advice_mode
  value: text("value").notNull(),
});

// === SCHEMAS ===

export const insertLogSchema = createInsertSchema(logs).omit({ id: true, createdAt: true, aiSummary: true });
export const insertIdeaSchema = createInsertSchema(ideas).omit({ id: true, createdAt: true, realityCheck: true, promotedSpec: true });
export const insertTeachingRequestSchema = createInsertSchema(teachingRequests).omit({ id: true, createdAt: true, output: true });
export const insertHarrisContentSchema = createInsertSchema(harrisContent).omit({ id: true, createdAt: true, generatedCopy: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

// === TYPES ===

export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;

export type TeachingRequest = typeof teachingRequests.$inferSelect;
export type InsertTeachingRequest = z.infer<typeof insertTeachingRequestSchema>;

export type HarrisContent = typeof harrisContent.$inferSelect;
export type InsertHarrisContent = z.infer<typeof insertHarrisContentSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

// === API REQUEST TYPES ===

export type CreateLogRequest = InsertLog;
export type CreateIdeaRequest = InsertIdea;
export type CreateTeachingRequest = InsertTeachingRequest;
export type CreateHarrisContentRequest = InsertHarrisContent;
export type UpdateIdeaRequest = Partial<InsertIdea> & {
  realityCheck?: any;
  promotedSpec?: any;
  status?: string;
};

// === RESPONSE TYPES ===
export type DashboardStats = {
  logsToday: number;
  openLoops: number;
  driftFlags: string[];
};
