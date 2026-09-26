'use client';

import { useState, type ReactNode } from 'react';
import { DevHeader } from '@/app/(dev)/_components/DevHeader';
import { Button } from '@/shared/ui/Button';
import { Chip, type ChipColor } from '@/shared/ui/Chip';
import { IconButton } from '@/shared/ui/IconButton';
import * as Icons from '@/shared/ui/icons';
import { SearchField } from '@/shared/ui/SearchField';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/Tabs';
import { TextField } from '@/shared/ui/TextField';

const TEXT_SCALE = [
  ['text-title1', 'text-title1 font-bold', '22px · 학기 제목'],
  ['text-title2', 'text-title2 font-bold', '20px · 강의 상세 제목'],
  ['text-title3', 'text-title3 font-bold', '17px · 패널 탭'],
  ['text-headline', 'text-headline font-bold', '15px · 검색 결과 강의명, 버튼'],
  ['text-body', 'text-body', '14px · 강의 상세 항목, 입력칸'],
  ['text-caption1', 'text-caption1', '13px · 교수 / 학점'],
  ['text-caption2', 'text-caption2 font-medium', '12px · 칩, 강의계획서 링크'],
] as const;

const INITIAL_CHIPS: { label: string; color: ChipColor }[] = [
  { label: '3학점', color: 'mint' },
  { label: '교양', color: 'red' },
  { label: '1학년', color: 'purple' },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title3 font-bold">{title}</h2>
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

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-10">
      <DevHeader title="기본 컴포넌트" />

      <Section title="글자 단계 (임시)">
        <div className="flex flex-col gap-2">
          {TEXT_SCALE.map(([name, className, description]) => (
            <div key={name} className="flex items-baseline gap-4">
              <code className="w-28 shrink-0 text-caption1 text-alternative">{name}</code>
              <span className={className}>서울대학교 시간표 SNUTT</span>
              <span className="text-caption1 text-assistive">{description}</span>
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
        <div className="grid max-w-sm grid-cols-[4rem_1fr] items-center gap-x-4 gap-y-3 text-body">
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
          <TabPanel value="search" className="py-3 text-body text-plain">
            검색 패널
          </TabPanel>
          <TabPanel value="lectures" className="py-3 text-body text-plain">
            강의 목록 패널
          </TabPanel>
          <TabPanel value="bookmark" className="py-3 text-body text-plain">
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

      <Section title="아이콘">
        <ul className="grid grid-cols-4 gap-3 lg:grid-cols-6">
          {Object.entries(Icons).map(([name, Icon]) => (
            <li key={name} className="flex flex-col items-center gap-1 text-plain">
              <Icon className="size-6" />
              <code className="text-caption2 text-alternative">{name.replace('Icon', '')}</code>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
