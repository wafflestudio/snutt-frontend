import errorTable from '@/utils/errorTable';

export interface ErrorRepository {
  getErrorMessage(args: { errcode: number; useDefaultMessage?: boolean }): string;
}

export const getErrorRepository = (): ErrorRepository => {
  return {
    getErrorMessage: ({ errcode, useDefaultMessage = true }) => {
      const matchingError = errorTable.find((e) => e.code === errcode);
      return matchingError ? matchingError.message : useDefaultMessage ? '에러가 발생했습니다' : '';
    },
  };
};
