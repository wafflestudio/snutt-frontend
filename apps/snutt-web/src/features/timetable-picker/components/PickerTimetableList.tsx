'use client';

/**
 * timetable-picker 왼쪽 목록 패널.
 * 시간표를 학기별 묶음으로 보여 주고, 하나를 선택할 수 있다.
 * 처음에 선택된 시간표가 있는 묶음만 펼친다.
 */
import { useState } from 'react';
import { formatSemesterTitle } from '@/domain/semester';
import { type TimetableId, type TimetableSummary } from '@/domain/timetable';
import { IconChevronRight } from '@/shared/ui/icons';
import { groupBySemester } from '@/features/timetable-picker/group-by-semester';

type Props = {
  timetables: readonly TimetableSummary[];
  selectedId: TimetableId | null;
  onSelect: (id: TimetableId) => void;
};

export function PickerTimetableList({ timetables, selectedId, onSelect }: Props) {
  const groups = groupBySemester(timetables);

  /** 선택된 시간표가 들어 있는 묶음 key → 처음에 펼침 */
  const initialOpenKey = groups.find((g) => g.timetables.some((t) => t.id === selectedId))?.key ?? groups[0]?.key;
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set(initialOpenKey ? [initialOpenKey] : []));

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {groups.map((group) => {
        const expanded = openKeys.has(group.key);
        return (
          <div key={group.key} className="border-b border-line-divider">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => toggle(group.key)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-14-medium text-normal"
              data-testid={`timetable-picker-group-header-${group.key}`}
            >
              <IconChevronRight
                className="size-4 shrink-0 text-icon-on-item transition-transform"
                style={{ transform: expanded ? 'rotate(90deg)' : undefined }}
                aria-hidden
              />
              {formatSemesterTitle(group.semester)}
            </button>

            {expanded && (
              <div>
                {group.timetables.map((timetable) => {
                  const selected = timetable.id === selectedId;
                  return (
                    <button
                      key={timetable.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSelect(timetable.id)}
                      className={
                        selected
                          ? 'w-full px-8 py-3 text-left text-14-medium text-snutt-dark-mint1'
                          : 'w-full px-8 py-3 text-left text-14-regular text-normal'
                      }
                      data-testid={`timetable-picker-item-${timetable.id}`}
                    >
                      {timetable.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
