'use client';

import { useState } from 'react';
import { FRIEND_STATES, type FriendState } from '@/domain/friend';
import { NoticeDialog } from '@/shared/ui/Dialog';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/Tabs';
import { FriendList } from './FriendList';

const TAB_LABELS: Record<FriendState, string> = {
  active: '친구',
  requested: '받은 요청',
  requesting: '보낸 요청',
};

/**
 * 친구 화면 (`/friends`). Figma 에 아직 친구 화면이 없어 디자인 스펙의 세 탭(ACTIVE · REQUESTED · REQUESTING)을
 * 메인 화면의 목록 패널 모양으로 만들었다. 오른쪽은 친구 시간표(8-3) 자리다. (디자인 문의 4-16)
 */
export function FriendsScreen() {
  const [state, setState] = useState<FriendState>('active');
  const [failure, setFailure] = useState<string | null>(null);

  return (
    <div className="flex min-w-0 flex-1">
      <NoticeDialog open={failure !== null} onOpenChange={(open) => !open && setFailure(null)} message={failure} />
      {/* 메인 화면의 목록 패널과 같은 폭 430px, 여백 20 */}
      <aside
        aria-label="친구 목록"
        className="flex w-107.5 shrink-0 flex-col gap-5 border-r border-line-light bg-normal px-5 pt-5"
      >
        <h1 className="text-22-bold text-normal">친구</h1>
        <Tabs value={state} onValueChange={setState} className="flex min-h-0 flex-1 flex-col gap-2">
          <TabList aria-label="친구 목록 종류">
            {FRIEND_STATES.map((value) => (
              <Tab key={value} value={value}>
                {TAB_LABELS[value]}
              </Tab>
            ))}
          </TabList>
          {FRIEND_STATES.map((value) => (
            <TabPanel key={value} value={value} className="min-h-0 flex-1 overflow-y-auto">
              <FriendList state={value} onFailure={setFailure} />
            </TabPanel>
          ))}
        </Tabs>
      </aside>
      <section className="flex min-w-0 flex-1 items-center justify-center text-14-regular text-assistive">
        친구 시간표 (8-3)
      </section>
    </div>
  );
}
