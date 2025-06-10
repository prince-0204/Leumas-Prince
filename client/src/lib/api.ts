import { apiRequest } from "./queryClient";
import type { Product, InsertProduct, UpdateProduct, Transaction, InsertTransaction, TransactionWithProduct } from "@shared/schema";

export interface DashboardMetrics {
  totalProducts: number;
  stockInToday: number;
  stockOutToday: number;
  lowStockItems: number;
}

// Product API
export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const res = await apiRequest("GET", "/api/products");
    return res.json();
  },

  getById: async (id: number): Promise<Product> => {
    const res = await apiRequest("GET", `/api/products/${id}`);
    return res.json();
  },

  create: async (product: InsertProduct): Promise<Product> => {
    const res = await apiRequest("POST", "/api/products", product);
    return res.json();
  },

  update: async (id: number, product: UpdateProduct): Promise<Product> => {
    const res = await apiRequest("PUT", `/api/products/${id}`, product);
    return res.json();
  },

  delete: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/products/${id}`);
  },
};

// Transaction API
export const transactionApi = {
  getAll: async (): Promise<TransactionWithProduct[]> => {
    const res = await apiRequest("GET", "/api/transactions");
    return res.json();
  },

  getByProduct: async (productId: number): Promise<TransactionWithProduct[]> => {
    const res = await apiRequest("GET", `/api/transactions?productId=${productId}`);
    return res.json();
  },

  create: async (transaction: InsertTransaction): Promise<Transaction> => {
    const res = await apiRequest("POST", "/api/transactions", transaction);
    return res.json();
  },
};

// Dashboard API
export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiRequest("GET", "/api/dashboard/metrics");
    return res.json();
  },

  getRecentTransactions: async (limit = 10): Promise<TransactionWithProduct[]> => {
    const res = await apiRequest("GET", `/api/dashboard/recent-transactions?limit=${limit}`);
    return res.json();
  },

  getLowStockProducts: async (threshold = 5): Promise<Product[]> => {
    const res = await apiRequest("GET", `/api/dashboard/low-stock?threshold=${threshold}`);
    return res.json();
  },
};
