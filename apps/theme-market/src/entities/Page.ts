export type PageRequest = {
  page: number;
};

export type PageResponse<T> = {
  content: T[];
  totalCount: number;
};
