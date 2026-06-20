import { User } from './user';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: TokenResponse;
}
