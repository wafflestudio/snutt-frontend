import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';

import { IcClock } from '@/components/icons/ic-clock';
import { IcDots } from '@/components/icons/ic-dots';
import { IcLabel } from '@/components/icons/ic-label';
import { IcMap } from '@/components/icons/ic-map';
import { serviceContext } from '@/contexts/ServiceContext';
import type { BaseLecture } from '@/entities/lecture';
import { useGuardContext } from '@/hooks/useGuardContext';
import { useYearSemester } from '@/hooks/useYearSemester';

type Props = { lecture: BaseLecture; cta: ReactNode };

export const MainLectureListItem = ({ lecture, cta }: Props) => {
  const { year, semester } = useYearSemester();
  const { lectureService } = useGuardContext(serviceContext);

  const department = [lecture.department, lecture.academic_year];
  const places = lecture.class_time_json.map((t) => t.place);
  const times = lectureService.getLectureTimeTexts(lecture);
  const emptyText = '-';
  const detailUrl =
    lecture.course_number && year && semester ? lectureService.getLectureDetailUrl(lecture, { year, semester }) : null;

  return (
    <LectureInner>
      <LectureHeader>
        <LectureHeaderLeft>
          <LectureTitle data-testid="main-lecture-listitem-title">{lecture.course_title}</LectureTitle>
          <LectureInstructor data-testid="main-lecture-listitem-instructor">
            {lecture.instructor} / {lecture.credit}학점
          </LectureInstructor>
        </LectureHeaderLeft>

        <LectureHeaderRight data-testid="main-lecture-listitem-right">
          {detailUrl && (
            <LectureButton
              as="a"
              href={detailUrl}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              data-testid="main-lecture-listitem-link"
            >
              강의계획서
            </LectureButton>
          )}

          {cta}
        </LectureHeaderRight>
      </LectureHeader>

      <LectureDescription data-testid="main-lecture-listitem-department">
        <LabelIcon />
        {department.some(Boolean) ? department.join(', ') : emptyText}
      </LectureDescription>

      <LectureDescription data-testid="main-lecture-listitem-time">
        <ClockIcon />
        {times.some(Boolean) ? times.join(', ') : emptyText}
      </LectureDescription>

      <LectureDescription data-testid="main-lecture-listitem-place">
        <MapIcon />
        {places.some(Boolean) ? places.map((v) => v || '-').join(', ') : emptyText}
      </LectureDescription>

      {lecture.remark && (
        <LectureDescription data-testid="main-lecture-listitem-remark" style={{ fontSize: 11, opacity: 0.6 }}>
          <DotsIcon />
          {lecture.remark}
        </LectureDescription>
      )}
    </LectureInner>
  );
};

const LectureInner = styled.div`
  margin: 0 24px;
  padding: 8px 0 12px;
  border-bottom: 1px solid #ebeef2;
`;

const LectureHeader = styled.div`
  justify-content: space-between;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const LectureHeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const LectureTitle = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
`;

const LectureInstructor = styled.div`
  margin-left: 6px;
  opacity: 0.6;
  font-size: 13px;
  line-height: 18px;
  min-width: 100px;
`;

const LectureHeaderRight = styled.div`
  display: flex;
  font-size: 13px;
  line-height: 18px;
  min-width: 150px;
  justify-content: flex-end;
`;

const LectureButton = styled.button<{ $color?: `#${string}` }>`
  border: none;
  background-color: transparent;
  color: ${({ $color = '#000000' }) => $color};
  opacity: 0.8;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 2px;
  text-decoration: none;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    color: #888;
    cursor: not-allowed;
  }
`;

const LectureDescription = styled.div`
  opacity: 0.8;
  margin-bottom: 2px;
  font-size: 12px;
  line-height: 18px;
  display: flex;
`;

const iconStyle = css`
  margin-right: 10px;
  min-width: 14px;
  margin-top: 1px;
`;

const LabelIcon = styled(IcLabel).attrs({ width: 14, height: 14 })`
  ${iconStyle}
`;

const ClockIcon = styled(IcClock).attrs({ width: 14, height: 14 })`
  ${iconStyle}
`;

const MapIcon = styled(IcMap).attrs({ width: 14, height: 14 })`
  ${iconStyle}
`;

const DotsIcon = styled(IcDots).attrs({ width: 14, height: 14 })`
  ${iconStyle}
`;
