export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
  userId: number;
  fullName: string;
  role: UserRole;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  referrerEmail?: string | null;
}

export interface RegisterResponse {
  id: number;
  fullName: string;
  email: string;
}

export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  message: string;
}

export type UserRole = 'SuperAdmin' | 'Admin' | 'User';

export interface AuthenticatedUser {
  userId: number;
  fullName: string;
  role: UserRole;
  token: string;
  expiresAtUtc: string;
}
