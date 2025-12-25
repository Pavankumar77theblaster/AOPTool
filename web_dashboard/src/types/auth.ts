export interface Token {
  access_token: string
  token_type: string
  expires_in?: number
}

export interface TokenPayload {
  sub: string
  exp: number
  iat: number
  role?: string
}

export interface User {
  username: string
  role: string
  created_at?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user?: User
}
