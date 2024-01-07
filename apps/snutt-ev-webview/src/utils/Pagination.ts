export type PaginationResponse<T> = {
  content: T[];
  cursor: string | null;
  size: number;
  last: boolean;
  total_count: number;
};
