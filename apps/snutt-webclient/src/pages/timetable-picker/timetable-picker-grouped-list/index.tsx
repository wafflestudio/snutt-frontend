import { useState } from 'react';
import styled, { css } from 'styled-components';

import { ServiceContext } from '@/contexts/ServiceContext';
import { type Timetable } from '@/entities/timetable';
import { useGuardContext } from '@/hooks/useGuardContext';
import { groupTimetablesBySemester, type GroupedTimetables } from '../utils/groupTimetablesBySemester';

type Props = {
  timetables: Timetable[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  currentYearSemester: { year: number; semester: 1 | 2 | 3 | 4 };
};

export const TimetablePickerGroupedList = ({ timetables, selectedId, onSelect, currentYearSemester }: Props) => {
  const { semesterService } = useGuardContext(ServiceContext);
  const grouped = groupTimetablesBySemester(timetables);

  const currentGroupKey = `${currentYearSemester.year}-${currentYearSemester.semester}`;
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    initial.add(currentGroupKey);
    return initial;
  });

  const toggleGroup = (key: string) => {
    const updated = new Set(expandedGroups);
    if (updated.has(key)) {
      updated.delete(key);
    } else {
      updated.add(key);
    }
    setExpandedGroups(updated);
  };

  return (
    <Wrapper>
      {grouped.map((group) => {
        const groupKey = `${group.year}-${group.semester}`;
        const isExpanded = expandedGroups.has(groupKey);

        return (
          <GroupContainer key={groupKey}>
            <GroupHeader
              onClick={() => toggleGroup(groupKey)}
              data-testid={`timetable-picker-group-header-${groupKey}`}
            >
              <ChevronIcon $expanded={isExpanded}>▶</ChevronIcon>
              <GroupLabel>{semesterService.courseBookToLabel(group)}</GroupLabel>
            </GroupHeader>

            {isExpanded && (
              <GroupContent data-testid={`timetable-picker-group-content-${groupKey}`}>
                {group.timetables.map((timetable) => (
                  <TimetableItem
                    key={timetable._id}
                    $selected={timetable._id === selectedId}
                    onClick={() => onSelect(timetable._id)}
                    data-testid={`timetable-picker-item-${timetable._id}`}
                  >
                    {timetable.title}
                  </TimetableItem>
                ))}
              </GroupContent>
            )}
          </GroupContainer>
        );
      })}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  overflow-y: auto;
`;

const GroupContainer = styled.div`
  border-bottom: 1px solid rgb(232, 235, 240);
`;

const GroupHeader = styled.button`
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  transition: background-color 0.15s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ChevronIcon = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  font-size: 12px;
  transition: transform 0.2s;
  transform: ${({ $expanded }) => ($expanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  color: rgba(0, 0, 0, 0.54);
`;

const GroupLabel = styled.span`
  flex: 1;
`;

const GroupContent = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.02);
`;

const TimetableItem = styled.button<{ $selected: boolean }>`
  padding: 12px 16px 12px 32px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
  transition: background-color 0.15s;

  ${({ $selected }) =>
    $selected &&
    css`
      background-color: #e3f2fd;
      color: #1976d2;
      font-weight: 500;
    `}

  &:hover {
    background-color: ${({ $selected }) => ($selected ? '#bbdefb' : 'rgba(0, 0, 0, 0.05)')};
  }

  &:active {
    background-color: ${({ $selected }) => ($selected ? '#90caf9' : 'rgba(0, 0, 0, 0.1)')};
  }
`;
