import { users, files, type User, type InsertUser, type File, type InsertFile } from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFile(id: string): Promise<File | undefined>;
  getFiles(): Promise<File[]>;
  getFilesByCategory(category: string): Promise<File[]>;
  deleteFile(id: string): Promise<boolean>;
  searchFiles(query: string, category?: string, mimeType?: string): Promise<File[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(insertFile)
      .returning();
    return file;
  }

  async getFile(id: string): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async getFiles(): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .orderBy(desc(files.uploadedAt));
  }

  async getFilesByCategory(category: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(eq(files.category, category))
      .orderBy(desc(files.uploadedAt));
  }

  async deleteFile(id: string): Promise<boolean> {
    const result = await db.delete(files).where(eq(files.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async searchFiles(query: string, category?: string, mimeType?: string): Promise<File[]> {
    const conditions = [];
    
    if (query) {
      const searchTerm = `%${query.toLowerCase()}%`;
      conditions.push(like(files.originalName, searchTerm));
    }
    
    if (category) {
      conditions.push(eq(files.category, category));
    }
    
    if (mimeType) {
      conditions.push(like(files.mimeType, `%${mimeType}%`));
    }
    
    if (conditions.length === 0) {
      return await this.getFiles();
    }
    
    return await db
      .select()
      .from(files)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions))
      .orderBy(desc(files.uploadedAt));
  }
}

export const storage = new DatabaseStorage();
