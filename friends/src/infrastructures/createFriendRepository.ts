import { ApiClient } from '../clients/apiClient';
import { CourseBook } from '../entities/courseBook';
import { FullTimetable } from '../entities/timetable';
import { FriendRepository } from '../repositories/friendRepository';

export const createFriendRepository = (apiClient: ApiClient): FriendRepository => {
  return {
    listFriends: ({ state }) =>
      apiClient.get<Awaited<ReturnType<FriendRepository['listFriends']>>>(`/v1/friends?state=${state}`),
    requestFriend: ({ nickname }) => apiClient.post<void>('/v1/friends', { nickname }),
    acceptFriend: ({ friendId }) => apiClient.post<void>(`/v1/friends/${friendId}/accept`),
    declineFriend: ({ friendId }) => apiClient.post<void>(`/v1/friends/${friendId}/decline`),
    deleteFriend: ({ friendId }) => apiClient.post<void>(`/v1/friends/${friendId}/delete`),
    getFriendPrimaryTable: ({ friendId }) => apiClient.get<FullTimetable>(`/v1/friends/${friendId}/primary-table`),
    getFriendRegisteredSemesters: ({ friendId }) =>
      apiClient.get<CourseBook[]>(`/v1/friends/${friendId}/registered-course-books`),
  };
};
