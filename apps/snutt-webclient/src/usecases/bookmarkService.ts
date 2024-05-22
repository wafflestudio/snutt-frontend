import { getErrorMessage } from '@/entities/error';
import { type Lecture } from '@/entities/lecture';
import { type RepositoryResponse, type UsecaseResponse } from '@/entities/response';
import { type SearchResultLecture } from '@/entities/search';

export type BookmarkService = {
  getBookmarkLectures: (_: { token: string; year: number; semester: number }) => UsecaseResponse<SearchResultLecture[]>;
  addBookmark: (_: { token: string; lectureId: Lecture['_id'] }) => UsecaseResponse<void>;
  removeBookmark: (_: { token: string; lectureId: Lecture['_id'] }) => UsecaseResponse<void>;
};

export const getBookmarkService = ({
  bookmarkRepository,
}: {
  bookmarkRepository: {
    getBookmarkLectures: (_: {
      token: string;
      year: number;
      semester: number;
    }) => RepositoryResponse<SearchResultLecture[]>;
    addBookmark: (_: { token: string; lectureId: Lecture['_id'] }) => RepositoryResponse<void>;
    removeBookmark: (_: { token: string; lectureId: Lecture['_id'] }) => RepositoryResponse<void>;
  };
}): BookmarkService => {
  return {
    getBookmarkLectures: async ({ token, year, semester }) => {
      const data = await bookmarkRepository.getBookmarkLectures({ token, year, semester });
      if (data.type === 'error') return { type: 'error', message: getErrorMessage(data) };
      return { type: 'success', data: data.data };
    },
    addBookmark: async ({ token, lectureId }) => {
      const data = await bookmarkRepository.addBookmark({ token, lectureId });
      if (data.type === 'error') return { type: 'error', message: getErrorMessage(data) };
      return { type: 'success' };
    },
    removeBookmark: async ({ token, lectureId }) => {
      const data = await bookmarkRepository.removeBookmark({ token, lectureId });
      if (data.type === 'error') return { type: 'error', message: getErrorMessage(data) };
      return { type: 'success' };
    },
  };
};
