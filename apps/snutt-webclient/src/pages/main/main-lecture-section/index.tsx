import styled from 'styled-components';

import { Tabs } from '@/components/tabs';
import type { SearchResultLecture } from '@/entities/search';
import type { FullTimetable, Timetable } from '@/entities/timetable';
import { MainBookmarkLectureTab } from '@/pages/main/main-lecture-section/main-bookmark-lecture-tab';

import { MainCurrentLectureTab } from './main-current-lecture-tab';
import { MainSearchLectureTab } from './main-search-lecture-tab';

type Props = {
  className?: string;
  tab: 'current' | 'result' | 'bookmark';
  changeTab: (tab: 'current' | 'result' | 'bookmark') => void;
  timetableData: { isEmpty: true } | { isEmpty: false; timetables: Timetable[]; currentTimetable: FullTimetable };
  hoveredLectureId: string | null;
  setHoveredLectureId: (id: string | null) => void;
  onClickLecture: (id: string) => void;
  searchResult?: SearchResultLecture[];
  setPreviewLectureId: (id: string | null) => void;
  previewLectureId: string | null;
  bookmarkLectures?: SearchResultLecture[];
};

export const MainLectureSection = ({
  tab,
  previewLectureId,
  changeTab,
  timetableData,
  className,
  hoveredLectureId,
  setHoveredLectureId,
  onClickLecture,
  setPreviewLectureId,
  searchResult,
  bookmarkLectures,
}: Props) => {
  const currentTimetable = timetableData.isEmpty
    ? null
    : {
        id: timetableData.currentTimetable._id,
        lectureIds: timetableData.currentTimetable.lecture_list.map((l) => l._id),
      };
  return (
    <Wrapper className={className}>
      <Tabs value={tab}>
        {(
          [
            { value: 'result', label: '검색 결과' },
            { value: 'current', label: '현재 시간표' },
            { value: 'bookmark', label: '관심강좌' },
          ] as const
        ).map(({ value, label }) => (
          <Tabs.Tab
            key={value}
            data-testid={`ml-${value}-tab`}
            value={value}
            aria-selected={tab === value}
            onClick={() => changeTab(value)}
          >
            {label}
          </Tabs.Tab>
        ))}
      </Tabs>
      <Content>
        {tab === 'current' && (
          <MainCurrentLectureTab
            hoveredLectureId={hoveredLectureId}
            setHoveredLectureId={setHoveredLectureId}
            onClickLecture={onClickLecture}
            openBookmarkTab={() => changeTab('bookmark')}
            timetableData={timetableData}
          />
        )}
        {tab === 'result' && (
          <MainSearchLectureTab
            previewLectureId={previewLectureId}
            currentTimetable={currentTimetable}
            searchResult={searchResult}
            setPreviewLectureId={setPreviewLectureId}
            hoveredLectureId={hoveredLectureId}
            setHoveredLectureId={setHoveredLectureId}
            onClickLecture={onClickLecture}
            openBookmarkTab={() => changeTab('bookmark')}
          />
        )}
        {tab === 'bookmark' && (
          <MainBookmarkLectureTab
            previewLectureId={previewLectureId}
            currentTimetable={currentTimetable}
            lectures={bookmarkLectures}
            setPreviewLectureId={setPreviewLectureId}
            hoveredLectureId={hoveredLectureId}
            setHoveredLectureId={setHoveredLectureId}
            onClickLecture={onClickLecture}
            openBookmarkTab={() => changeTab('bookmark')}
          />
        )}
      </Content>
    </Wrapper>
  );
};

const Wrapper = styled.section`
  padding: 20px 15px 0;
  position: relative;
`;

const Content = styled.div`
  background-color: #ffffff;
  top: 53px;
  left: 15px;
  right: 15px;
  bottom: 0;
  position: absolute;
`;
