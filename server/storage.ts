import {
  users,
  searches,
  searchResults,
  feedback,
  transactions,
  settings,
  type User,
  type InsertUser,
  type Search,
  type InsertSearch,
  type SearchResult,
  type InsertSearchResult,
  type Feedback,
  type InsertFeedback,
  type Transaction,
  type InsertTransaction,
  type Settings,
  type InsertSettings,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoinBalance(userId: number, newBalance: number): Promise<User>;
  
  // Search methods
  createSearch(search: InsertSearch): Promise<Search>;
  getSearch(id: number): Promise<Search | undefined>;
  getUserSearches(userId: number): Promise<Search[]>;
  
  // Search Result methods
  createSearchResult(result: InsertSearchResult): Promise<SearchResult>;
  getSearchResults(searchId: number): Promise<SearchResult[]>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getUserFeedback(userId: number): Promise<Feedback[]>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // Settings methods
  getUserSettings(userId: number): Promise<Settings | undefined>;
  createOrUpdateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private searches: Map<number, Search>;
  private searchResults: Map<number, SearchResult>;
  private feedbacks: Map<number, Feedback>;
  private transactions: Map<number, Transaction>;
  private userSettings: Map<number, Settings>;
  
  private userId: number;
  private searchId: number;
  private searchResultId: number;
  private feedbackId: number;
  private transactionId: number;
  private settingsId: number;

  constructor() {
    this.users = new Map();
    this.searches = new Map();
    this.searchResults = new Map();
    this.feedbacks = new Map();
    this.transactions = new Map();
    this.userSettings = new Map();
    
    this.userId = 1;
    this.searchId = 1;
    this.searchResultId = 1;
    this.feedbackId = 1;
    this.transactionId = 1;
    this.settingsId = 1;
    
    // Add demo user
    this.createUser({ username: "demo", password: "password" });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id, coinBalance: 50 };
    this.users.set(id, user);
    
    // Create default settings for new user
    this.createOrUpdateSettings({
      userId: id,
      notifications: true,
      privacyMode: true,
      autoDetect: true,
      googleEnabled: true,
      bingEnabled: true,
      duckDuckGoEnabled: true,
    });
    
    // Create welcome bonus transaction
    this.createTransaction({
      userId: id,
      amount: 50,
      description: "Welcome Bonus",
    });
    
    return user;
  }
  
  async updateUserCoinBalance(userId: number, newBalance: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    
    const updatedUser = { ...user, coinBalance: newBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Search methods
  async createSearch(search: InsertSearch): Promise<Search> {
    const id = this.searchId++;
    const timestamp = new Date();
    const newSearch: Search = { ...search, id, timestamp };
    this.searches.set(id, newSearch);
    return newSearch;
  }
  
  async getSearch(id: number): Promise<Search | undefined> {
    return this.searches.get(id);
  }
  
  async getUserSearches(userId: number): Promise<Search[]> {
    return Array.from(this.searches.values())
      .filter(search => search.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // Search Result methods
  async createSearchResult(result: InsertSearchResult): Promise<SearchResult> {
    const id = this.searchResultId++;
    const newResult: SearchResult = { ...result, id };
    this.searchResults.set(id, newResult);
    return newResult;
  }
  
  async getSearchResults(searchId: number): Promise<SearchResult[]> {
    return Array.from(this.searchResults.values())
      .filter(result => result.searchId === searchId);
  }
  
  // Feedback methods
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackId++;
    const timestamp = new Date();
    
    // Ensure array fields have default values
    const goodMatchElements = feedbackData.goodMatchElements || [];
    const poorMatchElements = feedbackData.poorMatchElements || [];
    
    // Add default values for ratings if not provided (removed from the schema)
    const newFeedback: Feedback = { 
      ...feedbackData, 
      id, 
      timestamp, 
      goodMatchElements, 
      poorMatchElements,
      // Set default ratings if not provided (for database schema compatibility)
      relevanceRating: (feedbackData as any).relevanceRating ?? 3,
      qualityRating: (feedbackData as any).qualityRating ?? 3
    };
    
    this.feedbacks.set(id, newFeedback);
    
    // Reward user with coins for detailed candidate feedback
    if (feedbackData.userId) {
      const user = await this.getUser(feedbackData.userId);
      if (user) {
        // Add 5 coins for feedback submission
        await this.updateUserCoinBalance(user.id, user.coinBalance + 5);
        
        // Create a transaction record
        await this.createTransaction({
          userId: user.id,
          amount: 5,
          description: "Feedback reward for candidate review"
        });
      }
    }
    
    return newFeedback;
  }
  
  async getUserFeedback(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values())
      .filter(feedback => feedback.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const timestamp = new Date();
    const newTransaction: Transaction = { ...transaction, id, timestamp };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // Settings methods
  async getUserSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.userSettings.values())
      .find(setting => setting.userId === userId);
  }
  
  async createOrUpdateSettings(settingsData: InsertSettings): Promise<Settings> {
    const existingSettings = await this.getUserSettings(settingsData.userId);
    
    if (existingSettings) {
      const updatedSettings: Settings = { ...existingSettings, ...settingsData };
      this.userSettings.set(existingSettings.id, updatedSettings);
      return updatedSettings;
    } else {
      const id = this.settingsId++;
      const newSettings: Settings = { ...settingsData, id };
      this.userSettings.set(id, newSettings);
      return newSettings;
    }
  }
}

export const storage = new MemStorage();
