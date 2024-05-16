import errorTable from '@/utils/errorTable';

export interface ErrorRepository {
  getErrorMessage(args: { errorCode: number; useDefaultMessage: boolean }): string;
}

export const getErrorRepository = (): ErrorRepository => {
  return {
    getErrorMessage: ({ errorCode, useDefaultMessage }) => {
      const matchingError = errorTable.find((e) => e.code === errorCode);
      return matchingError ? matchingError.message : useDefaultMessage ? '에러가 발생했습니다' : '';
    },
  };
};
