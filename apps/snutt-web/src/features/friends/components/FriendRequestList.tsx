'use client';

import { type Friend, getFriendLabel } from '@/domain/friend';
import { Button } from '@/shared/ui/Button';

type FriendRequestListProps = {
  requests: readonly Friend[];
  /** 처리 중인 요청. 같은 요청을 두 번 보내지 않도록 버튼을 막는다 */
  isPending: (friend: Friend) => boolean;
  onAccept: (friend: Friend) => void;
  /** 부르는 쪽이 확인 팝업을 연다 */
  onDecline: (friend: Friend) => void;
};

/** `친구 요청` 탭: 받은 요청 목록. 줄 오른쪽에 거절(Background/light · Text/med) · 수락(SNUTT/mint) */
export function FriendRequestList({ requests, isPending, onAccept, onDecline }: FriendRequestListProps) {
  return (
    <ul>
      {requests.map((friend) => {
        const label = getFriendLabel(friend);
        return (
          <li key={friend.id} className="flex items-center gap-3 px-2.5 pt-5 pb-4">
            <span className="min-w-0 flex-1 truncate text-15-medium text-normal">{label}</span>
            {/* Figma: 버튼 68 × 28, 둥글기 5, 14/Regular */}
            <div className="flex gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                className="w-17"
                disabled={isPending(friend)}
                aria-label={`${label} 거절`}
                onClick={() => onDecline(friend)}
              >
                거절
              </Button>
              <Button
                size="sm"
                className="w-17"
                disabled={isPending(friend)}
                aria-label={`${label} 수락`}
                onClick={() => onAccept(friend)}
              >
                수락
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
