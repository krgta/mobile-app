import { api } from '@/api/api'

import { User } from '@/types/user'
import { AuthResponse, TokenResponse } from '@/types/auth'

export async function login(
      email: string,
      password: string
) : Promise<AuthResponse> {
      const response = await api.post("/auth/login", {email, password});
      return response.data;
}

export async function getCurrentUser() : Promise<User> {
      const response = await api.get("/auth/me");
      return response.data;
}

export async function register(
      name:string,
      email: string,
      password: string
) : Promise<AuthResponse> {
      const response = await api.post("/auth/register", {name, email, password});
      return response.data
}

export async function refreshToken(refreshToken:string) : Promise<TokenResponse> {
      const response = await api.post("/auth/refresh", {refreshToken});
      console.log(response.data)
      return response.data
}