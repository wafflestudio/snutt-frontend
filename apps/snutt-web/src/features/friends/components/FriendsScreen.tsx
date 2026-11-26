'use client';

import { useQuery } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { friendQueries, useAcceptFriend, useDeclineFriend, useDeleteFriend, useRequestFriend } from '@/api/friends';
import { type Friend, type FriendId, parseNicknameWithTag } from '@/domain/friend';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog, NoticeDialog } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import { IconDockToRight, IconKakaotalk, IconPerson } from '@/shared/ui/icons';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/Tabs';
import { FriendList } from './FriendList';
import { FriendRequestList } from './FriendRequestList';
import { FriendTimetable } from './FriendTimetable';
import { InlineFieldForm } from './InlineFieldForm';

type FriendsTab = 'friends' | 'requests';

/** 확인을 받고 하는 동작 */
type Confirm = { type: 'delete'; friend: Friend } | { type: 'decline'; friend: Friend };

const CONFIRM_MESSAGES: Record<Confirm['type'], string> = {
  delete: '선택하신 친구를\n목록에서 삭제하시겠습니까?',
  decline: '친구요청을 거절하시겠습니까?\n목록에서 삭제됩니다.',
};

/**
 * 친구 화면 (`/friends`, Figma `친구시간표` 섹션). 왼쪽 430px 패널에 제목 · 패널 접기, `친구 목록` · `친구 요청` 탭,
 * 오른쪽에 고른 친구의 시간표. 처음에는 목록 첫 친구의 시간표를 보여 준다.
 * - 친구 목록: 카카오톡 친구 초대 · 닉네임으로 친구 요청, 줄마다 ⋮ (친구 이름 설정 · 목록에서 삭제)
 * - 친구 요청: 받은 요청의 거절(확인 팝업) · 수락(알림 팝업)
 */
export function FriendsScreen() {
  const [tab, setTab] = useState<FriendsTab>('friends');
  const [collapsed, setCollapsed] = useState(false);
  const [pickedId, setPickedId] = useState<FriendId | null>(null);
  const [renamingId, setRenamingId] = useState<FriendId | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const friends = useQuery(friendQueries.list('active'));
  const requests = useQuery(friendQueries.list('requested'));
  const accept = useAcceptFriend();
  const decline = useDeclineFriend();
  const remove = useDeleteFriend();

  // 고른 친구가 목록에 없으면(처음, 지운 뒤) 첫 친구
  const selected = friends.data?.find(({ id }) => id === pickedId) ?? friends.data?.[0] ?? null;
  const onError = (failure: Error) => setNotice(getFailureMessage(failure));

  const startRename = (friend: Friend) => {
    setCollapsed(false);
    setTab('friends');
    setRenamingId(friend.id);
  };

  return (
    <div className="flex min-w-0 flex-1">
      <NoticeDialog open={notice !== null} onOpenChange={(open) => !open && setNotice(null)} message={notice} />
      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        message={confirm && CONFIRM_MESSAGES[confirm.type]}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.type === 'delete') remove.mutate(confirm.friend.id, { onError });
          else decline.mutate(confirm.friend.id, { onError });
        }}
      />
      {!collapsed && (
        // Figma `검색 목록 영역`: 폭 430, 여백 위 · 양옆 20, 제목 · 탭 · 내용 사이 20
        <aside
          aria-label="친구 목록"
          className="flex w-107.5 shrink-0 flex-col gap-5 border-r border-line-light bg-normal px-5 pt-5"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-22-bold text-normal">친구시간표</h1>
            <IconButton
              label="패널 접기"
              icon={<IconDockToRight className="size-4!" />}
              onClick={() => setCollapsed(true)}
            />
          </div>
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-5">
            <TabList aria-label="친구 목록 종류">
              <Tab value="friends">친구 목록</Tab>
              <Tab value="requests">친구 요청</Tab>
            </TabList>
            <TabPanel value="friends" className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-5">
              <ListState
                query={friends}
                empty={{
                  title: '추가한 친구가 없습니다.',
                  description: '시간표를 공유하고 싶은 친구에게\n요청을 보내보세요!',
                }}
                header={(empty) => <AddFriendActions centered={empty} onNotice={setNotice} />}
              >
                {(list) => (
                  <FriendList
                    friends={list}
                    selectedId={selected?.id ?? null}
                    onSelect={(friend) => setPickedId(friend.id)}
                    renamingId={renamingId}
                    onRenamingChange={setRenamingId}
                    onDelete={(friend) => setConfirm({ type: 'delete', friend })}
                  />
                )}
              </ListState>
            </TabPanel>
            <TabPanel value="requests" className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-5">
              <ListState
                query={requests}
                empty={{
                  title: '받은 친구 요청이 없습니다.',
                  description: '친구가 나에게 요청을 보내면\n여기에서 수락또는 거절할 수 있어요.',
                }}
              >
                {(list) => (
                  <FriendRequestList
                    requests={list}
                    isPending={(friend) =>
                      (accept.isPending && accept.variables === friend.id) ||
                      (decline.isPending && decline.variables === friend.id)
                    }
                    onAccept={(friend) =>
                      accept.mutate(friend.id, { onSuccess: () => setNotice('친구요청을 수락하였습니다.'), onError })
                    }
                    onDecline={(friend) => setConfirm({ type: 'decline', friend })}
                  />
                )}
              </ListState>
            </TabPanel>
          </Tabs>
        </aside>
      )}
      <section aria-label="친구 시간표" className="flex min-w-0 flex-1 flex-col">
        <FriendTimetable
          key={selected?.id ?? 'none'}
          friend={selected}
          onRename={startRename}
          onDelete={(friend) => setConfirm({ type: 'delete', friend })}
          leading={
            collapsed && (
              <IconButton
                label="패널 펼치기"
                icon={<IconDockToRight className="size-4!" />}
                onClick={() => setCollapsed(false)}
              />
            )
          }
        />
      </section>
    </div>
  );
}

type ListStateProps = {
  query: { data: readonly Friend[] | undefined; error: Error | null };
  empty: { title: string; description: string };
  /** 목록 위에 둘 것. 목록이 비었으면 안내 아래 가운데에 둔다 */
  header?: (empty: boolean) => ReactNode;
  children: (list: readonly Friend[]) => ReactNode;
};

/** 목록의 불러오는 중 · 실패 · 빈 상태 (Figma `친구목록 empty` · `친구 요청 empty`) */
function ListState({ query: { data, error }, empty, header, children }: ListStateProps) {
  if (error)
    return (
      <EmptyMessage title="목록을 불러오지 못했습니다" description={getFailureMessage(error)}>
        {header?.(true)}
      </EmptyMessage>
    );
  if (!data) return <p className="pt-10 text-center text-14-regular text-alternative">불러오는 중</p>;
  if (data.length === 0)
    return (
      <EmptyMessage title={empty.title} description={empty.description}>
        {header?.(true)}
      </EmptyMessage>
    );
  return (
    <>
      {header?.(false)}
      {children(data)}
    </>
  );
}

/**
 * 빈 목록 안내: 제목(15/SemiBold) · 설명(13/body/regular, 검정 50% → Text/alternative).
 * Figma 의 고양이 그림은 받지 못해 아직 넣지 않았다 (디자인 문의 4-31)
 */
function EmptyMessage({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 pb-20 text-center">
      <p className="text-15-semibold text-normal">{title}</p>
      <p className="text-13-body-regular whitespace-pre-line text-alternative">{description}</p>
      {children && <div className="mt-3 w-full">{children}</div>}
    </div>
  );
}

/** `카카오톡 친구 초대` · `닉네임으로 친구 요청` 버튼과 닉네임 입력 상자 (Figma `친구 시간표_친구 추가`) */
function AddFriendActions({ centered, onNotice }: { centered: boolean; onNotice: (message: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRequestFriend();

  const close = () => {
    setAdding(false);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2.5 pb-1 text-left">
      {/* Figma: 헤더의 시간표 비교 버튼과 같은 모양 (14/Regular, 여백 4 · 10, 아이콘 16) */}
      <div className={centered ? 'flex justify-center gap-2' : 'flex gap-2'}>
        <Button
          variant="outline"
          size="sm"
          // 카카오 JavaScript SDK 와 앱 키가 아직 없어 초대 링크를 보낼 수 없다 (디자인 문의 4-31)
          onClick={() => onNotice('카카오톡 친구 초대는 아직 준비 중입니다.')}
        >
          <IconKakaotalk />
          카카오톡 친구 초대
        </Button>
        <Button variant="outline" size="sm" aria-expanded={adding} onClick={() => (adding ? close() : setAdding(true))}>
          <IconPerson />
          닉네임으로 친구 요청
        </Button>
      </div>
      {adding && (
        <InlineFieldForm
          label="추가할 친구의 닉네임 전체를 입력하세요."
          placeholder="닉네임#0000"
          submitLabel="요청 보내기"
          validate={(value) => (parseNicknameWithTag(value) ? null : '닉네임#0000 형식으로 입력해 주세요.')}
          error={error}
          onChange={() => setError(null)}
          pending={request.isPending}
          onCancel={close}
          onSubmit={(value) => {
            const target = parseNicknameWithTag(value);
            if (!target) return;
            request.mutate(target, {
              onSuccess: () => {
                close();
                onNotice('친구에게 요청을 보냈습니다.');
              },
              onError: (failure) => setError(getFailureMessage(failure)),
            });
          }}
        />
      )}
    </div>
  );
}
