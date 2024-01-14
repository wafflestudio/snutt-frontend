import { HttpClient } from '../clients/HttpClient';
import { Semester } from '../entities/semester';
import { FriendRepository } from '../repositories/friendRepository';
import { u } from '../utils/fromUnknown';
import { brand } from './../utils/brand';

export const createFriendRepository = (httpClient: HttpClient): FriendRepository => {
  return {
    listFriends: async ({ state }) =>
      httpClient
        .get(`/v1/friends?state=${state}`)
        .then((res) => u.object(res, 'content', 'totalCount', 'nextPageToken'))
        .then(async (data) => ({
          content: await Promise.all(
            u.array(data.content).map((friend) =>
              friend
                .then((f) => u.object(f, 'id', 'userId', 'displayName', 'nickname', 'createdAt'))
                .then(async (f) => ({
                  id: brand(u.string(f.id), 'FriendId'),
                  userId: brand(u.string(f.userId), 'UserId'),
                  displayName: f.displayName ? u.string(f.displayName) : undefined,
                  nickname: await u.object(f.nickname, 'nickname', 'tag').then((n) => ({
                    nickname: u.string(n.nickname),
                    tag: u.string(n.tag) as `${number}${number}`,
                  })),
                  createdAt: u.string(f.createdAt),
                })),
            ),
          ),
        })),
    requestFriend: ({ nickname }) => httpClient.post('/v1/friends', { nickname }),
    acceptFriend: ({ friendId }) => httpClient.post(`/v1/friends/${friendId}/accept`),
    declineFriend: ({ friendId }) => httpClient.post(`/v1/friends/${friendId}/decline`),
    deleteFriend: ({ friendId }) => httpClient.delete(`/v1/friends/${friendId}`),
    getFriendPrimaryTable: ({ friendId, semester, year }) =>
      httpClient.get(`/v1/friends/${friendId}/primary-table?year=${year}&semester=${semester}`),
    getFriendCourseBooks: ({ friendId }) =>
      httpClient
        .get(`/v1/friends/${friendId}/coursebooks`)
        .then((res) => u.array(res))
        .then((data) => data.map((cb) => u.object(cb, 'year', 'semester')))
        .then((data) => data.map((cb) => ({ year: u.number(cb.year), semester: u.number(cb.semester) as Semester }))),
    patchFriendDisplayName: ({ friendId, displayName }) =>
      httpClient.patch(`/v1/friends/${friendId}/display-name`, { displayName }),
  };
};
