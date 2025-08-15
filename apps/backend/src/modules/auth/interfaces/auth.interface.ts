export interface JwtPayload {
  sub: string; // User ID
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  tokens: AuthTokens;
}
