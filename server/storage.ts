import { users, products, transactions, type User, type InsertUser, type Product, type InsertProduct, type UpdateProduct, type Transaction, type InsertTransaction, type TransactionWithProduct } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Transaction methods
  getAllTransactions(): Promise<TransactionWithProduct[]>;
  getTransactionsByProduct(productId: number): Promise<TransactionWithProduct[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalProducts: number;
    stockInToday: number;
    stockOutToday: number;
    lowStockItems: number;
  }>;
  getRecentTransactions(limit?: number): Promise<TransactionWithProduct[]>;
  getLowStockProducts(threshold?: number): Promise<Product[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private transactions: Map<number, Transaction>;
  private currentUserId: number;
  private currentProductId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.transactions = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentTransactionId = 1;

    // Create default admin user
    this.createUser({ username: "admin", password: "admin123" });
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
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.sku === sku);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productUpdate: UpdateProduct): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...productUpdate };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Transaction methods
  async getAllTransactions(): Promise<TransactionWithProduct[]> {
    const transactions = Array.from(this.transactions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return Promise.all(transactions.map(async (transaction) => {
      const product = await this.getProduct(transaction.productId);
      return {
        ...transaction,
        productName: product?.name || 'Unknown Product',
        productSku: product?.sku || 'Unknown SKU',
      };
    }));
  }

  async getTransactionsByProduct(productId: number): Promise<TransactionWithProduct[]> {
    const transactions = Array.from(this.transactions.values())
      .filter(t => t.productId === productId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return Promise.all(transactions.map(async (transaction) => {
      const product = await this.getProduct(transaction.productId);
      return {
        ...transaction,
        productName: product?.name || 'Unknown Product',
        productSku: product?.sku || 'Unknown SKU',
      };
    }));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      timestamp: new Date(),
    };
    this.transactions.set(id, newTransaction);

    // Update product stock
    const product = await this.getProduct(transaction.productId);
    if (product) {
      const stockChange = transaction.type === 'IN' ? transaction.quantity : -transaction.quantity;
      await this.updateProduct(transaction.productId, {
        currentStock: Math.max(0, product.currentStock + stockChange)
      });
    }

    return newTransaction;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalProducts: number;
    stockInToday: number;
    stockOutToday: number;
    lowStockItems: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = Array.from(this.transactions.values())
      .filter(t => t.timestamp >= today);

    const stockInToday = todayTransactions
      .filter(t => t.type === 'IN')
      .reduce((sum, t) => sum + t.quantity, 0);

    const stockOutToday = todayTransactions
      .filter(t => t.type === 'OUT')
      .reduce((sum, t) => sum + t.quantity, 0);

    const lowStockItems = Array.from(this.products.values())
      .filter(p => p.currentStock <= 5).length;

    return {
      totalProducts: this.products.size,
      stockInToday,
      stockOutToday,
      lowStockItems,
    };
  }

  async getRecentTransactions(limit = 10): Promise<TransactionWithProduct[]> {
    const recent = Array.from(this.transactions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return Promise.all(recent.map(async (transaction) => {
      const product = await this.getProduct(transaction.productId);
      return {
        ...transaction,
        productName: product?.name || 'Unknown Product',
        productSku: product?.sku || 'Unknown SKU',
      };
    }));
  }

  async getLowStockProducts(threshold = 5): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.currentStock <= threshold)
      .sort((a, b) => a.currentStock - b.currentStock);
  }
}

export const storage = new MemStorage();
