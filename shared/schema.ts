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

// Search schema
export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  query: text("query").notNull(),
  engine: text("engine").notNull(),
  resultsCount: text("results_count"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertSearchSchema = createInsertSchema(searches).pick({
  userId: true,
  query: true,
  engine: true,
  resultsCount: true,
});

// Search Result schema
export const searchResults = pgTable("search_results", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").notNull(),
  title: text("title").notNull(),
  snippet: text("snippet"),
  url: text("url").notNull(),
});

export const insertSearchResultSchema = createInsertSchema(searchResults).pick({
  searchId: true,
  title: true,
  snippet: true,
  url: true,
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
  googleEnabled: boolean("google_enabled").notNull().default(true),
  bingEnabled: boolean("bing_enabled").notNull().default(true),
  duckDuckGoEnabled: boolean("duckduckgo_enabled").notNull().default(true),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  notifications: true,
  privacyMode: true,
  autoDetect: true,
  googleEnabled: true,
  bingEnabled: true,
  duckDuckGoEnabled: true,
});

// Zod schemas for API validation
export const feedbackSubmissionSchema = z.object({
  searchId: z.number(),
  relevanceRating: z.number().min(1).max(5),
  qualityRating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const searchDataSchema = z.object({
  query: z.string(),
  engine: z.string(),
  resultsCount: z.string().optional(),
  results: z.array(
    z.object({
      title: z.string(),
      snippet: z.string().optional(),
      url: z.string(),
    })
  ),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

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
