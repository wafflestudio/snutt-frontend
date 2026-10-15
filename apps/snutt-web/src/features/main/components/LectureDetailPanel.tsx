'use client';

import { clsx } from 'clsx';
import { type ReactNode, useId, useState } from 'react';
import type { ColorPair, LectureColor } from '@/domain/color';
import { formatQuota, getSyllabusUrl, isCustomLecture, type TimetableLecture } from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import { compareDayTimeRange, DAY_LABELS, formatMinute } from '@/domain/time';
import { ColorSelect } from '@/shared/ui/ColorSelect';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { IconArrowOutward } from '@/shared/ui/icons';
import { Tab, TabList, Tabs } from '@/shared/ui/Tabs';
import type { LectureDetail } from '@/features/main/main-view';
import { PanelColumn, PanelNav } from './PanelColumn';

type LectureDetailPanelProps = {
  detail: LectureDetail;
  lecture: TimetableLecture;
  /** 강의계획서 주소에 쓴다 */
  semester: Semester;
  palette: readonly ColorPair[];
  /** 강의 상세 / 강의평 전환. null 이면 상세를 닫는다 (`<`) */
  onChange: (detail: LectureDetail | null) => void;
  /** `×`: 패널을 접는다 */
  onClose: () => void;
  onColorChange: (color: LectureColor) => void;
  onRemove: () => void;
};

/**
 * 강의 상세 (Figma `강의 상세`). 목록 옆에 열린다.
 * 지도에서 보기는 6-3, 강의편집은 6-2, 강의평 쪽은 8-4 에서 채운다.
 */
export function LectureDetailPanel({
  detail,
  lecture,
  semester,
  palette,
  onChange,
  onClose,
  onColorChange,
  onRemove,
}: LectureDetailPanelProps) {
  return (
    <PanelColumn label="강의 상세" className="overflow-y-auto">
      <PanelNav backLabel="목록으로" onBack={() => onChange(null)} onClose={onClose} />

      {/* Figma: 제목과 전환 버튼은 위에서 70, 제목은 왼쪽 29 · 전환 버튼은 오른쪽 28 */}
      <div className="mt-5.5 flex items-start justify-between gap-3 pr-7 pl-7.25">
        <h2 className="min-w-0 py-px text-20-bold break-keep text-normal">{lecture.title}</h2>
        <Tabs
          value={detail.view}
          onValueChange={(view) => onChange({ ...detail, view, editing: false })}
          variant="segmented"
          className="shrink-0"
        >
          <TabList aria-label="강의 상세 보기">
            <Tab value="info">강의 상세</Tab>
            <Tab value="review">강의평</Tab>
          </TabList>
        </Tabs>
      </div>

      {detail.view === 'info' ? (
        <LectureInfo
          lecture={lecture}
          semester={semester}
          palette={palette}
          onColorChange={onColorChange}
          onRemove={onRemove}
        />
      ) : (
        <p className="px-6.5 pt-6.75 text-14-regular text-assistive">강의평 (8-4)</p>
      )}
    </PanelColumn>
  );
}

type LectureInfoProps = Pick<
  LectureDetailPanelProps,
  'lecture' | 'semester' | 'palette' | 'onColorChange' | 'onRemove'
>;

function LectureInfo({ lecture, semester, palette, onColorChange, onRemove }: LectureInfoProps) {
  const [removing, setRemoving] = useState(false);
  // 직접 추가한 강의는 수강편람 정보가 없어서 수강 정보 · 강의계획서를 빼고 학점만 위에 둔다
  const custom = isCustomLecture(lecture);
  const syllabusUrl = getSyllabusUrl(lecture, semester);

  return (
    // Figma: 본문은 위에서 128, 왼쪽 26 · 오른쪽 32, 덩어리 사이 20 (구분선 위아래)
    <div className="mt-6.75 flex flex-col gap-5 pr-8 pb-3.75 pl-6.5">
      <dl className="flex flex-col gap-3.75">
        <InfoRow label="강의명">{lecture.title}</InfoRow>
        <InfoRow label="교수">{lecture.instructor}</InfoRow>
        {custom && <InfoRow label="학점">{lecture.credit}</InfoRow>}
        <InfoRow label="색상" className="items-center">
          <ColorSelect
            variant="compact"
            palette={palette}
            value={lecture.color}
            onValueChange={onColorChange}
            aria-label="색상"
          />
        </InfoRow>
      </dl>

      {!custom && (
        <>
          <Divider />
          <InfoSection title="수강 정보">
            <dl className="flex flex-col gap-3.75">
              <InfoRow label="학과">{lecture.department}</InfoRow>
              <InfoRow label="학년">{lecture.academicYear}</InfoRow>
              <InfoRow label="학점">{lecture.credit}</InfoRow>
              <InfoRow label="분류">{lecture.classification}</InfoRow>
              <InfoRow label="구분">{lecture.category}</InfoRow>
              <InfoRow label="(구)교양영역">{lecture.categoryPre2025}</InfoRow>
              <InfoRow label="강좌번호">{lecture.courseNumber}</InfoRow>
              <InfoRow label="분반번호">{lecture.lectureNumber}</InfoRow>
              <InfoRow label="정원(재학생)">{formatQuota(lecture)}</InfoRow>
            </dl>
          </InfoSection>
        </>
      )}

      <Divider />
      <InfoSection title="비고">
        <p className="text-14-regular whitespace-pre-line text-plain">{lecture.remark ?? <Empty />}</p>
      </InfoSection>

      <Divider />
      <InfoSection title="시간 및 장소">
        {lecture.classTimes.length > 0 ? (
          // Figma: 수업 시간 사이 20, 시간 · 장소 줄 사이 6
          <ul className="flex flex-col gap-5">
            {[...lecture.classTimes].sort(compareDayTimeRange).map((time) => (
              <li key={`${time.day}-${time.startMinute}`}>
                <dl className="flex flex-col gap-1.5">
                  <InfoRow label="시간">
                    {`${DAY_LABELS[time.day]} ${formatMinute(time.startMinute)} ~ ${formatMinute(time.endMinute)}`}
                  </InfoRow>
                  <InfoRow label="장소">{time.place}</InfoRow>
                </dl>
              </li>
            ))}
          </ul>
        ) : (
          <Empty />
        )}
      </InfoSection>

      <Divider />
      {/* Figma: 한 줄 30, 줄 사이 20 */}
      <div className="flex flex-col items-start gap-5">
        {syllabusUrl && (
          <a href={syllabusUrl} target="_blank" rel="noreferrer" className={ACTION_CLASSES}>
            강의계획서
            <IconArrowOutward className="size-5" />
          </a>
        )}
        <button type="button" onClick={() => setRemoving(true)} className={clsx(ACTION_CLASSES, 'text-snutt-red')}>
          삭제
        </button>
      </div>

      <ConfirmDialog
        open={removing}
        onOpenChange={setRemoving}
        message={`‘${lecture.title}’ 강의를 삭제하시겠습니까?`}
        confirmLabel="삭제"
        onConfirm={onRemove}
      />
    </div>
  );
}

const ACTION_CLASSES = clsx(
  'flex h-7.5 items-center gap-3.75 rounded-sm text-15-semibold text-plain',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint',
);

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    // Figma: 소제목과 내용 사이 15
    <section aria-labelledby={id} className="flex flex-col gap-3.75">
      <h3 id={id} className="text-15-semibold text-plain">
        {title}
      </h3>
      {children}
    </section>
  );
}

type InfoRowProps = {
  label: string;
  /** 값이 없으면 `(없음)` 을 쓴다 */
  children: ReactNode;
  /** 세로 정렬. 기본은 위 맞춤 (값이 여러 줄일 때) */
  className?: string;
};

/** Figma: 라벨 80px, 라벨과 값 사이 20, 한 줄 20 */
function InfoRow({ label, children, className }: InfoRowProps) {
  return (
    <div className={clsx('flex min-h-5 gap-5', className ?? 'items-start')}>
      <dt className="w-20 shrink-0 text-14-regular text-alternative">{label}</dt>
      <dd className="min-w-0 text-14-regular break-keep text-plain">{children ?? <Empty />}</dd>
    </div>
  );
}

function Empty() {
  return <span className="text-assistive">(없음)</span>;
}

/** Figma 의 `Fills/Secondary` 선. Semantic 에 없는 색이라 가장 가까운 Line/light 를 쓴다 (디자인 문의 3장) */
function Divider() {
  return <hr className="border-line-light" />;
}
