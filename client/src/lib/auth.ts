import { apiRequest } from "./api";
import { LoginData } from "@shared/schema";

export interface User {
  id: number;
  username: string;
}

class AuthService {
  private user: User | null = null;

  async login(credentials: LoginData): Promise<User> {
    const res = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await res.json();
    this.user = data.user;
    localStorage.setItem("user", JSON.stringify(this.user));
    return this.user;
  }

  logout(): void {
    this.user = null;
    localStorage.removeItem("user");
  }

  getCurrentUser(): User | null {
    if (!this.user) {
      const stored = localStorage.getItem("user");
      if (stored) {
        this.user = JSON.parse(stored);
      }
    }
    return this.user;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();
