import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  coinBalance: integer("coin_balance").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Candidate schema
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"),
  location: text("location"),
  currentPosition: text("current_position"),
  currentWorkplace: text("current_workplace"),
  pastPosition1: text("past_position_1"),
  pastWorkplace1: text("past_workplace_1"),
  pastPosition2: text("past_position_2"),
  pastWorkplace2: text("past_workplace_2"),
  education: text("education"),
  specialization: text("specialization"),
  connectionType: text("connection_type"),
  mutualConnections: text("mutual_connections"),
  profileStatus: text("profile_status"),
  profileUrl: text("profile_url"),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
});

// Search schema
export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  query: text("query").notNull(),
  source: text("source").notNull().default("RecruiterPro"),
  resultsCount: text("results_count"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertSearchSchema = createInsertSchema(searches).pick({
  userId: true,
  query: true,
  source: true,
  resultsCount: true,
});

// Search Result schema (for candidate search results)
export const searchResults = pgTable("search_results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  matchScore: integer("match_score").notNull().default(0),
  highlighted: boolean("highlighted").notNull().default(false),
});

export const insertSearchResultSchema = createInsertSchema(searchResults).pick({
  searchId: true,
  candidateId: true,
  matchScore: true,
  highlighted: true,
});

// Feedback schema
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  searchId: integer("search_id").notNull(),
  relevanceRating: integer("relevance_rating").notNull(),
  qualityRating: integer("quality_rating").notNull(),
  comment: text("comment"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).pick({
  userId: true,
  searchId: true,
  relevanceRating: true,
  qualityRating: true,
  comment: true,
});

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  description: true,
});

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  notifications: boolean("notifications").notNull().default(true),
  privacyMode: boolean("privacy_mode").notNull().default(true),
  autoDetect: boolean("auto_detect").notNull().default(true),
  linkedInEnabled: boolean("linkedin_enabled").notNull().default(true),
  indeedEnabled: boolean("indeed_enabled").notNull().default(true),
  zipRecruiterEnabled: boolean("ziprecruiter_enabled").notNull().default(true),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  notifications: true,
  privacyMode: true,
  autoDetect: true,
  linkedInEnabled: true,
  indeedEnabled: true,
  zipRecruiterEnabled: true,
});

// Zod schemas for API validation
export const feedbackSubmissionSchema = z.object({
  searchId: z.number(),
  relevanceRating: z.number().min(1).max(5),
  qualityRating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

// Candidate search data schema
export const candidateDataSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  location: z.string().optional(),
  currentPosition: z.string().optional(),
  currentWorkplace: z.string().optional(),
  pastPosition1: z.string().optional(),
  pastWorkplace1: z.string().optional(),
  education: z.string().optional(),
  specialization: z.string().optional(),
  connectionType: z.string().optional(),
  mutualConnections: z.string().optional(),
  profileStatus: z.string().optional(),
  profileUrl: z.string().optional(),
  matchScore: z.number().optional(),
});

export const searchDataSchema = z.object({
  query: z.string(),
  source: z.string(),
  resultsCount: z.string().optional(),
  results: z.array(candidateDataSchema),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type Search = typeof searches.$inferSelect;
export type InsertSearch = z.infer<typeof insertSearchSchema>;

export type SearchResult = typeof searchResults.$inferSelect;
export type InsertSearchResult = z.infer<typeof insertSearchResultSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type FeedbackSubmission = z.infer<typeof feedbackSubmissionSchema>;
export type SearchData = z.infer<typeof searchDataSchema>;
export type CandidateData = z.infer<typeof candidateDataSchema>;
