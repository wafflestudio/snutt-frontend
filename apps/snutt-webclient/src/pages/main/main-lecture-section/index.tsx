import styled from 'styled-components';

import { Tabs } from '@/components/tabs';
import type { SearchResultLecture } from '@/entities/search';
import type { FullTimetable, Timetable } from '@/entities/timetable';

import { MainCurrentLectureTab } from './main-current-lecture-tab';
import { MainSearchLectureTab } from './main-search-lecture-tab';

type Props = {
  className?: string;
  tab: 'current' | 'result';
  changeTab: (tab: 'current' | 'result') => void;
  currentFullTimetable: FullTimetable | undefined;
  currentYearSemesterTimetables?: Timetable[];
  hoveredLectureId: string | null;
  setHoveredLectureId: (id: string | null) => void;
  onClickLecture: (id: string) => void;
  searchResult?: SearchResultLecture[];
  setPreviewLectureId: (id: string | null) => void;
  previewLectureId: string | null;
};

export const MainLectureSection = ({
  tab,
  previewLectureId,
  changeTab,
  currentYearSemesterTimetables,
  className,
  currentFullTimetable,
  hoveredLectureId,
  setHoveredLectureId,
  onClickLecture,
  setPreviewLectureId,
  searchResult,
}: Props) => {
  return (
    <Wrapper className={className}>
      <Tabs value={tab}>
        <Tabs.Tab
          data-testid="ml-result-tab"
          value="result"
          aria-selected={tab === 'result'}
          onClick={() => changeTab('result')}
        >
          검색결과
        </Tabs.Tab>
        <Tabs.Tab
          data-testid="ml-current-tab"
          value="current"
          aria-selected={tab === 'current'}
          onClick={() => changeTab('current')}
        >
          현재 시간표
        </Tabs.Tab>
      </Tabs>
      <Content>
        {tab === 'current' && (
          <MainCurrentLectureTab
            currentYearSemesterTimetables={currentYearSemesterTimetables}
            hoveredLectureId={hoveredLectureId}
            setHoveredLectureId={setHoveredLectureId}
            onClickLecture={onClickLecture}
            currentFullTimetable={currentFullTimetable}
          />
        )}
        {tab === 'result' && (
          <MainSearchLectureTab
            previewLectureId={previewLectureId}
            currentFullTimetable={currentFullTimetable}
            searchResult={searchResult}
            setPreviewLectureId={setPreviewLectureId}
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
