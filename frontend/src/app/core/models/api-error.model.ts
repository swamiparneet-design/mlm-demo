export interface ApiErrorPayload {
  status: number;
  message: string;
  errors?: Record<string, string[]> | null;
}
