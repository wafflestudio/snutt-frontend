'use client';

import { useState, type ReactNode } from 'react';
import { DevHeader } from '@/app/(dev)/_components/DevHeader';
import { SAMPLE_PALETTE } from '@/app/(dev)/_components/sample-palette';
import type { LectureColor } from '@/domain/color';
import { Button } from '@/shared/ui/Button';
import { Chip, type ChipColor } from '@/shared/ui/Chip';
import { ColorSelect } from '@/shared/ui/ColorSelect';
import { ConfirmDialog, Dialog, DialogCloseButton, DialogTitle } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import * as Icons from '@/shared/ui/icons';
import { Menu, MenuItem } from '@/shared/ui/Menu';
import { SearchField } from '@/shared/ui/SearchField';
import { Select } from '@/shared/ui/Select';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/Tabs';
import { TextField } from '@/shared/ui/TextField';

const TEXT_STYLES = [
  ['text-22-bold', '학기 제목'],
  ['text-17-bold', '선택된 패널 탭'],
  ['text-17-semibold', '패널 탭'],
  ['text-15-bold', '검색 결과 강의명'],
  ['text-15-medium', '버튼 (임시)'],
  ['text-14-semibold', '좌측 바 라벨, 강의 상세 / 강의평 전환'],
  ['text-14-medium', ''],
  ['text-14-regular', '검색창, 입력칸'],
  ['text-13-medium', '강의계획서 링크'],
  ['text-13-regular', '교수 / 학점, 학과, 시간, 장소'],
  ['text-12-medium', '필터 칩'],
] as const;

const INITIAL_CHIPS: { label: string; color: ChipColor }[] = [
  { label: '전공', color: 'orange' },
  { label: '4학년', color: 'red' },
  { label: '3학점', color: 'lime' },
  { label: '컴퓨터공학부', color: 'mint' },
  { label: '교양', color: 'blue' },
  { label: '월요일', color: 'navy' },
  { label: '영어진행', color: 'purple' },
  { label: '평점 높은 순', color: 'gray' },
];

const DAY_OPTIONS = ['월', '화', '수', '목', '금', '토', '일'].map((label, value) => ({ value, label }));

// 30분 간격. 직접 추가의 시간 표시(`오전 9:00`)와 같은 형식
const TIME_OPTIONS = Array.from({ length: 31 }, (_, i) => {
  const minute = 8 * 60 + i * 30;
  const hour = Math.floor(minute / 60);
  const label = `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}:${String(minute % 60).padStart(2, '0')}`;
  return { value: minute, label };
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-17-bold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export function UiGallery() {
  const [panelTab, setPanelTab] = useState<'search' | 'lectures' | 'bookmark'>('search');
  const [detailTab, setDetailTab] = useState<'info' | 'review'>('info');
  const [bookmarked, setBookmarked] = useState(false);
  const [chips, setChips] = useState(INITIAL_CHIPS);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const [day, setDay] = useState(0);
  const [startMinute, setStartMinute] = useState(9 * 60);
  const [color, setColor] = useState<LectureColor>({ type: 'palette', index: 0 });

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-10">
      <DevHeader title="기본 컴포넌트" />

      <Section title="글자 스타일">
        <div className="flex flex-col gap-2">
          {TEXT_STYLES.map(([className, description]) => (
            <div key={className} className="flex items-baseline gap-4">
              <code className="w-36 shrink-0 text-13-regular text-alternative">{className}</code>
              <span className={className}>서울대학교 시간표 SNUTT</span>
              <span className="text-13-regular text-assistive">{description}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Button">
        <Row>
          <Button>추가</Button>
          <Button variant="secondary">취소</Button>
          <Button variant="outline">
            <Icons.IconEdit />
            직접 추가
          </Button>
          <Button disabled>비활성</Button>
        </Row>
        <Row>
          <Button size="sm" variant="outline">
            <Icons.IconEdit />
            직접 추가
          </Button>
          <Button size="sm" variant="outline">
            <Icons.IconCompare />
            시간표 비교
          </Button>
        </Row>
      </Section>

      <Section title="IconButton">
        <Row>
          <IconButton
            variant="circle"
            label={bookmarked ? '관심강좌에서 빼기' : '관심강좌에 담기'}
            aria-pressed={bookmarked}
            icon={bookmarked ? <Icons.IconBookmarkFill /> : <Icons.IconBookmark />}
            onClick={() => setBookmarked((b) => !b)}
          />
          <IconButton variant="circle" label="시간표에 담기" icon={<Icons.IconAdd />} />
          <IconButton variant="circle" label="시간표에서 빼기" icon={<Icons.IconRemove />} />
          <IconButton label="뒤로" icon={<Icons.IconChevronLeft />} />
          <IconButton label="닫기" icon={<Icons.IconClose />} />
          <IconButton label="더보기" icon={<Icons.IconMoreHorizontal />} />
        </Row>
      </Section>

      <Section title="SearchField · TextField">
        <SearchField
          placeholder="강의명, 교수명을 검색하세요"
          aria-label="강의 검색"
          className="max-w-sm"
          trailing={<IconButton label="검색 필터" icon={<Icons.IconFilter />} />}
        />
        <div className="grid max-w-sm grid-cols-[4rem_1fr] items-center gap-x-4 gap-y-3 text-14-regular">
          <label htmlFor="ui-title" className="text-alternative">
            강의명
          </label>
          <TextField id="ui-title" defaultValue="미국학개론" />
          <label htmlFor="ui-instructor" className="text-alternative">
            교수
          </label>
          <TextField id="ui-instructor" placeholder="(없음)" />
        </div>
      </Section>

      <Section title="Chip">
        <Row>
          {chips.map(({ label, color }) => (
            <Chip
              key={label}
              label={label}
              color={color}
              onRemove={() => setChips((prev) => prev.filter((c) => c.label !== label))}
            />
          ))}
          {chips.length === 0 && (
            <Button size="sm" variant="outline" onClick={() => setChips(INITIAL_CHIPS)}>
              되돌리기
            </Button>
          )}
        </Row>
      </Section>

      <Section title="Tabs">
        <Tabs value={panelTab} onValueChange={setPanelTab} className="max-w-sm">
          <TabList>
            <Tab value="search">검색</Tab>
            <Tab value="lectures">강의 목록</Tab>
            <Tab value="bookmark">관심강좌</Tab>
          </TabList>
          <TabPanel value="search" className="py-3 text-14-regular text-plain">
            검색 패널
          </TabPanel>
          <TabPanel value="lectures" className="py-3 text-14-regular text-plain">
            강의 목록 패널
          </TabPanel>
          <TabPanel value="bookmark" className="py-3 text-14-regular text-plain">
            관심강좌 패널
          </TabPanel>
        </Tabs>
        <Tabs value={detailTab} onValueChange={setDetailTab} variant="segmented">
          <TabList>
            <Tab value="info">강의 상세</Tab>
            <Tab value="review">강의평</Tab>
          </TabList>
        </Tabs>
      </Section>

      <Section title="Dialog">
        <Row>
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            확인 팝업
          </Button>
          <Button variant="outline" onClick={() => setModalOpen(true)}>
            큰 모달
          </Button>
          <span className="text-13-regular text-alternative">{lastAction}</span>
        </Row>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          message="관심강좌 탭으로 이동하시겠습니까?"
          onConfirm={() => setLastAction('확인을 눌렀다')}
        />
        <Dialog open={modalOpen} onOpenChange={setModalOpen} className="flex h-162 w-173.75 flex-col p-5">
          <div className="flex items-center justify-between">
            <DialogTitle>필터</DialogTitle>
            <DialogCloseButton />
          </div>
          <p className="mt-4 text-14-regular text-plain">필터 내용은 5-3 에서 만든다.</p>
        </Dialog>
      </Section>

      <Section title="Menu">
        <Row>
          <Menu align="end" trigger={<IconButton label="시간표 메뉴" icon={<Icons.IconMoreHorizontal />} />}>
            <MenuItem onClick={() => setLastAction('기본 시간표로 지정')}>기본 시간표로 지정</MenuItem>
            <MenuItem onClick={() => setLastAction('이름 변경')}>이름 변경</MenuItem>
            <MenuItem onClick={() => setLastAction('삭제')}>삭제</MenuItem>
          </Menu>
          <span className="text-13-regular text-alternative">{lastAction}</span>
        </Row>
      </Section>

      <Section title="Select · ColorSelect">
        <div className="grid max-w-sm grid-cols-[4rem_1fr] items-center gap-x-4 gap-y-3 text-14-regular">
          <label htmlFor="ui-color" className="text-alternative">
            색상
          </label>
          <ColorSelect id="ui-color" palette={SAMPLE_PALETTE} value={color} onValueChange={setColor} />
          <span className="text-alternative">시간</span>
          <div className="flex gap-2">
            <Select aria-label="요일" options={DAY_OPTIONS} value={day} onValueChange={setDay} className="w-16" />
            <Select aria-label="시작 시간" options={TIME_OPTIONS} value={startMinute} onValueChange={setStartMinute} />
          </div>
        </div>
        <Row>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setColor({ type: 'custom', color: { bg: '#ffd8d8', fg: '#c43a3a' } })}
          >
            앱에서 직접 고른 색으로 바꾸기
          </Button>
        </Row>
      </Section>

      <Section title="아이콘">
        <ul className="grid grid-cols-4 gap-3 lg:grid-cols-6">
          {Object.entries(Icons).map(([name, Icon]) => (
            <li key={name} className="flex flex-col items-center gap-1 text-plain">
              <Icon className="size-6" />
              <code className="text-12-medium text-alternative">{name.replace('Icon', '')}</code>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
