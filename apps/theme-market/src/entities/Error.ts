export interface ApiError extends Error {
  errCode: number;
  message: string;
  displayMessage: string;
}
