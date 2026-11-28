'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { useRenameFriend } from '@/api/friends';
import {
  DISPLAY_NAME_MAX_LENGTH,
  type Friend,
  type FriendId,
  getFriendLabel,
  isValidDisplayName,
} from '@/domain/friend';
import { IconButton } from '@/shared/ui/IconButton';
import { IconMoreVertical } from '@/shared/ui/icons';
import { FriendMenu } from './FriendMenu';
import { InlineFieldForm } from './InlineFieldForm';

type FriendListProps = {
  friends: readonly Friend[];
  /** 시간표를 보고 있는 친구 */
  selectedId: FriendId | null;
  onSelect: (friend: Friend) => void;
  /** 이름을 고치고 있는 친구. 줄 대신 입력 상자를 보여 준다 */
  renamingId: FriendId | null;
  onRenamingChange: (id: FriendId | null) => void;
  /** `목록에서 삭제` 를 골랐을 때. 부르는 쪽이 확인 팝업을 연다 */
  onDelete: (friend: Friend) => void;
};

/**
 * `친구 목록` 탭의 목록 (Figma 친구 시간표). 줄을 누르면 오른쪽에 그 친구의 시간표를 보여 주고,
 * 줄 오른쪽 ⋮ 메뉴로 이름을 고치거나 목록에서 지운다.
 */
export function FriendList({ friends, selectedId, onSelect, renamingId, onRenamingChange, onDelete }: FriendListProps) {
  return (
    <ul>
      {friends.map((friend) =>
        friend.id === renamingId ? (
          <li key={friend.id} className="py-1">
            <RenameForm friend={friend} onClose={() => onRenamingChange(null)} />
          </li>
        ) : (
          // Figma: 여백 위 20 · 아래 16 · 양옆 10, 이름 15/Medium. Figma 대로 위아래를 다르게 두면 한글 이름이 2px 아래로
          // 치우쳐 보여서, 높이(54)는 그대로 두고 위아래 18 로 맞췄다
          <li key={friend.id} className="flex items-center gap-1">
            <button
              type="button"
              aria-pressed={friend.id === selectedId}
              onClick={() => onSelect(friend)}
              className={clsx(
                'min-w-0 flex-1 cursor-pointer truncate rounded-md px-2.5 py-4.5 text-left text-15-medium text-normal hover:bg-light',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-snutt-mint',
                // 고른 줄 표시는 Figma 에 없어 임시로 Background/light (디자인 문의 4-31)
                friend.id === selectedId && 'bg-light',
              )}
            >
              {getFriendLabel(friend)}
            </button>
            <FriendMenu
              trigger={<IconButton label={`${getFriendLabel(friend)} 메뉴`} icon={<IconMoreVertical />} />}
              onRename={() => onRenamingChange(friend.id)}
              onDelete={() => onDelete(friend)}
            />
          </li>
        ),
      )}
    </ul>
  );
}

const INVALID_NAME_MESSAGE = `공백 포함 한/영/숫자 ${DISPLAY_NAME_MAX_LENGTH}자 이내`;

function RenameForm({ friend, onClose }: { friend: Friend; onClose: () => void }) {
  const rename = useRenameFriend();
  const [error, setError] = useState<string | null>(null);

  return (
    <InlineFieldForm
      label="나에게 표시될 친구 이름"
      defaultValue={friend.displayName ?? ''}
      placeholder={friend.nickname}
      submitLabel="저장"
      validate={(value) => (isValidDisplayName(value) ? null : INVALID_NAME_MESSAGE)}
      error={error}
      onChange={() => setError(null)}
      pending={rename.isPending}
      onCancel={onClose}
      onSubmit={(displayName) =>
        rename.mutate(
          { id: friend.id, displayName },
          { onSuccess: onClose, onError: (failure) => setError(getFailureMessage(failure)) },
        )
      }
    />
  );
}
