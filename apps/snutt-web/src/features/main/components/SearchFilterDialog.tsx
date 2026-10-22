'use client';

import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { type ReactNode, useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { lectureQueries } from '@/api/lectures';
import {
  ETC_TAG_LABELS,
  type EtcTag,
  type FilterChipKind,
  getFilterChips,
  groupCategories,
  type MultiFilterField,
  SEARCH_SORT_LABELS,
  type SearchFilter,
  type SearchSort,
  type SearchTags,
  toggleValue,
} from '@/domain/search-filter';
import type { Semester } from '@/domain/semester';
import type { DayTimeRange } from '@/domain/time';
import { Button } from '@/shared/ui/Button';
import { Checkbox } from '@/shared/ui/Checkbox';
import { Chip, type ChipColor } from '@/shared/ui/Chip';
import { Dialog, DialogCloseButton, DialogTitle } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import { IconChevronDown, IconChevronRight, IconStar, IconStarFill } from '@/shared/ui/icons';
import { SearchField } from '@/shared/ui/SearchField';
import { toggleFavoriteDepartment, useFavoriteDepartments } from '@/features/main/department-favorites';
import { TimeSearchDialog } from './TimeSearchDialog';

type FilterPage = 'sort' | MultiFilterField | 'time' | 'etc';

// Figma `필터 LNB` 의 순서. `구분` 은 어떤 값인지 몰라 뺐다 (디자인 문의 4-21)
const PAGES: readonly { page: FilterPage; label: string }[] = [
  { page: 'sort', label: '정렬기준' },
  { page: 'classification', label: '분류' },
  { page: 'department', label: '학과' },
  { page: 'academicYear', label: '학년' },
  { page: 'credit', label: '학점' },
  { page: 'category', label: '교양영역' },
  { page: 'categoryPre2025', label: '(구)교양영역' },
  { page: 'time', label: '시간' },
  { page: 'etc', label: '기타' },
];

/*
 * 칩 색. Figma 메인 화면의 예(전공 orange, 4학년 red, 3학점 lime, 컴퓨터공학부 mint, 평점 높은 순 gray, 영강 purple)를 따르고,
 * 나머지는 남은 색으로 정했다 (디자인 문의 4-21)
 */
const CHIP_COLORS: Record<FilterChipKind, ChipColor> = {
  sort: 'gray',
  classification: 'orange',
  department: 'mint',
  academicYear: 'red',
  credit: 'lime',
  category: 'blue',
  categoryPre2025: 'blue',
  etc: 'purple',
  time: 'navy',
};

/** 적용한 필터의 칩 (`3학점 ×`). 검색창 아래와 필터 모달 아래에 쓴다 */
export function FilterChips({ value, onChange }: { value: SearchFilter; onChange: (value: SearchFilter) => void }) {
  return getFilterChips(value).map((chip) => (
    <Chip
      key={chip.key}
      label={chip.label}
      color={CHIP_COLORS[chip.kind]}
      onRemove={() => onChange(chip.remove(value))}
    />
  ));
}

type SearchFilterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 고를 수 있는 값은 학기마다 다르다 */
  semester: Semester;
  /** 지금 검색에 쓰는 필터. 열 때마다 이 값으로 시작한다 */
  value: SearchFilter;
  /** `필터 적용` 을 누르면 고친 필터를 준다. 닫기(×) · Esc · 바깥을 누르면 고친 것을 버린다 */
  onChange: (value: SearchFilter) => void;
  /** 고른 시간표의 수업 시간 (시간대 검색 모달의 회색 칸) */
  occupied: readonly DayTimeRange[];
};

/**
 * 필터 모달 (Figma `필터 …`, 695 × 649): 왼쪽 목록에서 종류를 고르고 오른쪽에서 값을 고른다. 아래에는 고른 필터의 칩과 `필터 적용`.
 * `시간` 의 `시간대 직접 선택하기` 는 시간대 검색 모달(5-4)을 연다.
 */
export function SearchFilterDialog({ open, onOpenChange, ...props }: SearchFilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="flex h-162.25 w-173.75 flex-col overflow-hidden">
      {/* 열 때마다 새로 그려서 value 로 돌아간다 */}
      <SearchFilterForm {...props} onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}

function SearchFilterForm({
  semester,
  value,
  onChange,
  occupied,
  onClose,
}: Omit<SearchFilterDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }) {
  const [filter, setFilter] = useState(value);
  const [page, setPage] = useState<FilterPage>('sort');
  const [timeOpen, setTimeOpen] = useState(false);
  const tags = useQuery(lectureQueries.tags(semester));
  const label = PAGES.find((item) => item.page === page)?.label;

  return (
    <>
      <DialogTitle className="sr-only">검색 필터</DialogTitle>
      <div className="flex min-h-0 flex-1">
        {/* Figma `필터 LNB`: 폭 160, 한 줄 44, 고른 줄은 Background/light 에 `>` */}
        <nav aria-label="필터 종류" className="flex w-40 shrink-0 flex-col border-r border-line-light pt-4">
          {PAGES.map((item) => (
            <button
              key={item.page}
              type="button"
              aria-current={item.page === page ? 'true' : undefined}
              onClick={() => setPage(item.page)}
              className={clsx(
                'flex h-11 items-center gap-1 px-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-snutt-mint',
                item.page === page
                  ? 'bg-light text-14-semibold text-normal'
                  : 'text-14-regular text-plain hover:bg-light-field',
              )}
            >
              {item.label}
              {item.page === page && <IconChevronRight className="size-4" />}
            </button>
          ))}
        </nav>

        {/* Figma: 제목은 위 · 왼쪽 30, 값은 제목보다 16 안쪽 */}
        <section aria-label={label} className="relative flex min-h-0 min-w-0 flex-1 flex-col pt-6.5 pl-7.5">
          <h3 className="text-20-semibold text-normal">{label}</h3>
          <DialogCloseButton className="absolute top-5 right-5" />
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-7.5 pb-4">
            {page === 'sort' ? (
              <SortOptions value={filter.sort} onChange={(sort) => setFilter({ ...filter, sort })} />
            ) : page === 'time' ? (
              <Options>
                <Checkbox
                  checked={filter.time.emptyOnly}
                  onCheckedChange={(emptyOnly) => setFilter({ ...filter, time: { ...filter.time, emptyOnly } })}
                >
                  빈시간대만 검색하기
                </Checkbox>
                {/* 누르면 시간대 검색 모달을 연다. 고른 시간을 지우려면 칩의 × 를 누른다 */}
                <Checkbox checked={filter.time.times.length > 0} onCheckedChange={() => setTimeOpen(true)}>
                  시간대 직접 선택하기
                </Checkbox>
              </Options>
            ) : page === 'etc' ? (
              <Options>
                {(Object.keys(ETC_TAG_LABELS) as EtcTag[]).map((tag) => (
                  <Checkbox
                    key={tag}
                    checked={filter.etc.includes(tag)}
                    onCheckedChange={() => setFilter({ ...filter, etc: toggleValue(filter.etc, tag) })}
                  >
                    {ETC_TAG_LABELS[tag]}
                  </Checkbox>
                ))}
              </Options>
            ) : tags.isPending ? (
              <Message>불러오는 중</Message>
            ) : tags.isError ? (
              <Message>{getFailureMessage(tags.error)}</Message>
            ) : (
              <TagOptions field={page} tags={tags.data} filter={filter} onChange={setFilter} />
            )}
          </div>
        </section>
      </div>

      {/* Figma: 높이 64, 여백 15, 위 선 */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-t border-line-light px-4">
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          <FilterChips value={filter} onChange={setFilter} />
        </div>
        {/* Figma 는 80 × 32 인데 그 크기의 버튼이 없어 시간대 검색의 완료처럼 기본 버튼(높이 38)을 쓴다 (디자인 문의 4-21) */}
        <Button
          className="shrink-0"
          onClick={() => {
            onChange(filter);
            onClose();
          }}
        >
          필터 적용
        </Button>
      </div>

      <TimeSearchDialog
        open={timeOpen}
        onOpenChange={setTimeOpen}
        value={filter.time}
        onChange={(time) => setFilter({ ...filter, time })}
        occupied={occupied}
      />
    </>
  );
}

/** 정렬기준은 하나만 고른다. 고른 것을 다시 누르면 기본 순서로 돌아간다 */
function SortOptions({ value, onChange }: { value: SearchSort | null; onChange: (sort: SearchSort | null) => void }) {
  return (
    <Options>
      {(Object.keys(SEARCH_SORT_LABELS) as SearchSort[]).map((sort) => (
        <Checkbox key={sort} checked={value === sort} onCheckedChange={(checked) => onChange(checked ? sort : null)}>
          {SEARCH_SORT_LABELS[sort]}
        </Checkbox>
      ))}
    </Options>
  );
}

type TagOptionsProps = {
  field: MultiFilterField;
  tags: SearchTags;
  filter: SearchFilter;
  onChange: (filter: SearchFilter) => void;
};

/** 서버가 준 학기의 값으로 고르는 종류 (분류, 학과, 학년, 학점, 교양영역) */
function TagOptions({ field, tags, filter, onChange }: TagOptionsProps) {
  const values: readonly (string | number)[] = tags[field];
  const selected: readonly (string | number)[] = filter[field];
  const toggle = (value: string | number) => onChange({ ...filter, [field]: toggleValue(selected, value) });
  const option = (value: string | number) => (
    <Checkbox key={value} checked={selected.includes(value)} onCheckedChange={() => toggle(value)}>
      {field === 'credit' ? `${value}학점` : value}
    </Checkbox>
  );

  if (values.length === 0) return <Message>이 학기에는 고를 수 있는 값이 없습니다</Message>;
  if (field === 'department')
    return <DepartmentOptions departments={tags.department} selected={filter.department} onToggle={toggle} />;
  if (field === 'category' || field === 'categoryPre2025')
    return (
      <div className="flex flex-col gap-6">
        {groupCategories(tags[field], field).map((group) => (
          <CategoryGroup
            key={group.title ?? ''}
            title={group.title}
            categories={group.categories}
            selected={filter[field]}
            onChange={(next) => onChange({ ...filter, [field]: next })}
          >
            {group.categories.map(option)}
          </CategoryGroup>
        ))}
      </div>
    );
  return <Options>{values.map(option)}</Options>;
}

type CategoryGroupProps = {
  /** 어느 묶음에도 없는 영역은 이름 없이 맨 뒤에 둔다 */
  title: string | null;
  categories: readonly string[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  children: ReactNode;
};

/** 교양영역 묶음 (Figma `학문의 토대 ^ … 전체 선택`). 접고 펼치고, 묶음을 한 번에 고르거나 푼다 */
function CategoryGroup({ title, categories, selected, onChange, children }: CategoryGroupProps) {
  const [open, setOpen] = useState(true);
  const all = categories.every((category) => selected.includes(category));
  return (
    <section aria-label={title ?? '그 밖의 영역'} className="flex flex-col gap-3">
      {title && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-14-semibold text-normal"
          >
            {title}
            <IconChevronDown className={clsx('size-4', open && 'rotate-180')} />
          </button>
          <button
            type="button"
            onClick={() =>
              onChange(
                all
                  ? selected.filter((item) => !categories.includes(item))
                  : [...selected, ...categories.filter((item) => !selected.includes(item))],
              )
            }
            className="text-12-regular text-assistive"
          >
            {all ? '전체 해제' : '전체 선택'}
          </button>
        </div>
      )}
      {open && <Options>{children}</Options>}
    </section>
  );
}

type DepartmentOptionsProps = {
  departments: readonly string[];
  selected: readonly string[];
  onToggle: (department: string) => void;
};

/** 학과: 이름으로 찾고, ★ 로 즐겨찾기에 넣은 학과를 위에 따로 보여 준다 (Figma `필터 학과`) */
function DepartmentOptions({ departments, selected, onToggle }: DepartmentOptionsProps) {
  const [query, setQuery] = useState('');
  const favorites = useFavoriteDepartments();
  const matches = (department: string) => department.includes(query.trim());
  // 이 학기에 없는 학과는 즐겨찾기에 있어도 보여 주지 않는다
  const favoriteList = favorites.filter((department) => departments.includes(department) && matches(department));

  const row = (department: string) => (
    <li key={department} className="flex items-center justify-between gap-3">
      <Checkbox checked={selected.includes(department)} onCheckedChange={() => onToggle(department)}>
        {department}
      </Checkbox>
      <IconButton
        label={`${department} 즐겨찾기`}
        aria-pressed={favorites.includes(department)}
        icon={
          favorites.includes(department) ? (
            <IconStarFill className="size-5 text-snutt-yellow" />
          ) : (
            <IconStar className="size-5 text-assistive" />
          )
        }
        onClick={() => toggleFavoriteDepartment(department)}
      />
    </li>
  );

  return (
    <div className="flex flex-col gap-5">
      <SearchField
        aria-label="학과 검색"
        placeholder="학과명을 검색하세요."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {favoriteList.length > 0 && <DepartmentSection title="즐겨찾기">{favoriteList.map(row)}</DepartmentSection>}
      <DepartmentSection title="전체 학과">{departments.filter(matches).map(row)}</DepartmentSection>
    </div>
  );
}

function DepartmentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="flex flex-col gap-2">
      <h4 className="text-14-medium text-normal">{title}</h4>
      <ul className="flex flex-col gap-1 pl-4">{children}</ul>
    </section>
  );
}

/** Figma: 값 한 줄 33, 제목보다 16 안쪽 */
function Options({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4.5 pl-4">{children}</div>;
}

function Message({ children }: { children: ReactNode }) {
  return <p className="pt-4 text-14-regular text-assistive">{children}</p>;
}
