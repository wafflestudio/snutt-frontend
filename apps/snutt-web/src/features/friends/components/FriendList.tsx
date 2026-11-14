'use client';

import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { getFailureMessage } from '@/api/errors';
import { friendQueries, useAcceptFriend, useDeclineFriend } from '@/api/friends';
import { formatNicknameWithTag, type Friend, type FriendId, type FriendState, getFriendName } from '@/domain/friend';
import { Button } from '@/shared/ui/Button';

const EMPTY_MESSAGES: Record<FriendState, string> = {
  active: '아직 친구가 없습니다',
  requested: '받은 친구 요청이 없습니다',
  requesting: '보낸 친구 요청이 없습니다',
};

type FriendListProps = {
  state: FriendState;
  /** 수락 · 거절이 실패했을 때. 서버가 준 메시지를 넘긴다 */
  onFailure: (message: string) => void;
  /** 시간표를 보고 있는 친구 */
  selectedId?: FriendId | null;
  /** 있으면 줄을 눌러 친구를 고른다 (친구 탭에서 시간표 보기) */
  onSelect?: (friend: Friend) => void;
};

/**
 * 친구 · 받은 요청 · 보낸 요청 중 하나의 목록. 받은 요청에만 거절 · 수락 버튼이 있다.
 * onSelect 를 넘기면 줄을 눌러 친구를 고른다 (친구 시간표, 8-3). 이름 변경 · 삭제(8-2)는 아직 없다.
 */
export function FriendList({ state, onFailure, selectedId = null, onSelect }: FriendListProps) {
  const { data: friends, error } = useQuery(friendQueries.list(state));
  const accept = useAcceptFriend();
  const decline = useDeclineFriend();

  if (error)
    return (
      <ListMessage>
        목록을 불러오지 못했습니다
        <span className="text-13-regular">{getFailureMessage(error)}</span>
      </ListMessage>
    );
  if (!friends) return <ListMessage>불러오는 중</ListMessage>;
  if (friends.length === 0) return <ListMessage>{EMPTY_MESSAGES[state]}</ListMessage>;

  const onError = (failure: Error) => onFailure(getFailureMessage(failure));
  // 같은 요청을 두 번 보내지 않도록, 처리 중인 요청의 버튼은 막는다
  const isPending = (friend: Friend) =>
    (accept.isPending && accept.variables === friend.id) || (decline.isPending && decline.variables === friend.id);

  return (
    <ul className="divide-y divide-line-light">
      {friends.map((friend) => {
        const name = (
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-15-bold text-normal">{getFriendName(friend)}</span>
            <span className="truncate text-13-regular text-assistive">{formatNicknameWithTag(friend)}</span>
          </div>
        );
        if (onSelect)
          return (
            <li key={friend.id} className="py-1">
              {/* 고른 줄과 커서를 올린 줄은 Background/light (디자인 문의 4-28) */}
              <button
                type="button"
                aria-pressed={friend.id === selectedId}
                onClick={() => onSelect(friend)}
                className={clsx(
                  'flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-light',
                  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-snutt-mint',
                  friend.id === selectedId && 'bg-light',
                )}
              >
                {name}
              </button>
            </li>
          );
        return (
          <li key={friend.id} className="flex items-center gap-3 py-3">
            {name}
            {state === 'requested' && (
              <div className="flex gap-1.5">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isPending(friend)}
                  aria-label={`${formatNicknameWithTag(friend)} 거절`}
                  onClick={() => decline.mutate(friend.id, { onError })}
                >
                  거절
                </Button>
                <Button
                  size="sm"
                  disabled={isPending(friend)}
                  aria-label={`${formatNicknameWithTag(friend)} 수락`}
                  onClick={() => accept.mutate(friend.id, { onError })}
                >
                  수락
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ListMessage({ children }: { children: ReactNode }) {
  return (
    <p className="flex flex-col items-center gap-2 pt-10 text-center text-14-regular text-alternative">{children}</p>
  );
}
