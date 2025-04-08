import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { searchDataSchema, feedbackSubmissionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the extension
  const router = express.Router();
  
  // Authentication routes
  router.post("/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create a session in memory
      if (!req.session) {
        return res.status(500).json({ message: "Session management error" });
      }
      
      req.session.userId = user.id;
      
      return res.json({
        id: user.id,
        username: user.username,
        coinBalance: user.coinBalance
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "An error occurred during login" });
    }
  });
  
  router.get("/auth/me", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        coinBalance: user.coinBalance
      });
    } catch (error) {
      console.error("Auth check error:", error);
      return res.status(500).json({ message: "An error occurred checking authentication" });
    }
  });
  
  // Register account route
  router.post("/auth/register", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    try {
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }
      
      const newUser = await storage.createUser({ username, password });
      
      if (!req.session) {
        return res.status(500).json({ message: "Session management error" });
      }
      
      req.session.userId = newUser.id;
      
      return res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        coinBalance: newUser.coinBalance
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "An error occurred during registration" });
    }
  });
  
  // Logout route
  router.post("/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy(() => {
        res.status(200).json({ message: "Logged out successfully" });
      });
    } else {
      res.status(200).json({ message: "Already logged out" });
    }
  });
  
  // Search data submission route
  router.post("/searches", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const searchData = searchDataSchema.parse(req.body);
      
      // Create search record
      const search = await storage.createSearch({
        userId: req.session.userId,
        query: searchData.query,
        engine: searchData.engine,
        resultsCount: searchData.resultsCount,
      });
      
      // Create search results
      for (const result of searchData.results) {
        await storage.createSearchResult({
          searchId: search.id,
          title: result.title,
          snippet: result.snippet,
          url: result.url,
        });
      }
      
      return res.status(201).json({ searchId: search.id });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid search data", errors: error.errors });
      }
      console.error("Search submission error:", error);
      return res.status(500).json({ message: "An error occurred submitting search data" });
    }
  });
  
  // Feedback submission route
  router.post("/feedback", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const feedbackData = feedbackSubmissionSchema.parse(req.body);
      
      // Verify search exists
      const search = await storage.getSearch(feedbackData.searchId);
      if (!search) {
        return res.status(404).json({ message: "Search not found" });
      }
      
      // Create feedback record
      const newFeedback = await storage.createFeedback({
        userId: req.session.userId,
        searchId: feedbackData.searchId,
        relevanceRating: feedbackData.relevanceRating,
        qualityRating: feedbackData.qualityRating,
        comment: feedbackData.comment,
      });
      
      // Award coins for feedback
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const rewardAmount = 5; // Fixed reward amount for feedback
      const newBalance = user.coinBalance + rewardAmount;
      
      // Update user's coin balance
      await storage.updateUserCoinBalance(user.id, newBalance);
      
      // Record transaction
      await storage.createTransaction({
        userId: user.id,
        amount: rewardAmount,
        description: "Feedback Reward",
      });
      
      return res.status(201).json({
        feedbackId: newFeedback.id,
        coinsAwarded: rewardAmount,
        newBalance: newBalance
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      console.error("Feedback submission error:", error);
      return res.status(500).json({ message: "An error occurred submitting feedback" });
    }
  });
  
  // Get user wallet info
  router.get("/wallet", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const transactions = await storage.getUserTransactions(user.id);
      
      return res.json({
        balance: user.coinBalance,
        transactions: transactions
      });
    } catch (error) {
      console.error("Wallet retrieval error:", error);
      return res.status(500).json({ message: "An error occurred retrieving wallet data" });
    }
  });
  
  // Get user settings
  router.get("/settings", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const settings = await storage.getUserSettings(req.session.userId);
      
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      
      return res.json(settings);
    } catch (error) {
      console.error("Settings retrieval error:", error);
      return res.status(500).json({ message: "An error occurred retrieving settings" });
    }
  });
  
  // Update user settings
  router.put("/settings", async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { notifications, privacyMode, autoDetect, googleEnabled, bingEnabled, duckDuckGoEnabled } = req.body;
      
      const updateData = {
        userId: req.session.userId,
        notifications: notifications !== undefined ? notifications : true,
        privacyMode: privacyMode !== undefined ? privacyMode : true,
        autoDetect: autoDetect !== undefined ? autoDetect : true,
        googleEnabled: googleEnabled !== undefined ? googleEnabled : true,
        bingEnabled: bingEnabled !== undefined ? bingEnabled : true,
        duckDuckGoEnabled: duckDuckGoEnabled !== undefined ? duckDuckGoEnabled : true,
      };
      
      const updatedSettings = await storage.createOrUpdateSettings(updateData);
      
      return res.json(updatedSettings);
    } catch (error) {
      console.error("Settings update error:", error);
      return res.status(500).json({ message: "An error occurred updating settings" });
    }
  });

  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
