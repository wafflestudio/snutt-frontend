'use client';

import { clsx } from 'clsx';
import { type FormEvent, type ReactNode, useId, useState } from 'react';
import { type ColorPair, isSameLectureColor, type LectureColor } from '@/domain/color';
import {
  type ClassTime,
  type CustomLectureInput,
  formatQuota,
  getSyllabusUrl,
  isCustomLecture,
  type TimetableLecture,
} from '@/domain/lecture';
import type { Semester } from '@/domain/semester';
import { compareDayTimeRange, DAY_LABELS, formatMinute } from '@/domain/time';
import { Button } from '@/shared/ui/Button';
import { ColorSelect } from '@/shared/ui/ColorSelect';
import { ConfirmDialog } from '@/shared/ui/Dialog';
import { IconArrowOutward } from '@/shared/ui/icons';
import { Tab, TabList, Tabs } from '@/shared/ui/Tabs';
import { TextArea, TextField } from '@/shared/ui/TextField';
import { openInPopup } from '@/shared/lib/open-in-popup';
import type { LectureDetail } from '@/features/main/main-view';
import { ClassTimeFields, getClassTimeError, type TimeRow, toClassTimes, toTimeRows } from './ClassTimeFields';
import { PanelColumn, PanelNav } from './PanelColumn';

type SaveOptions = { force: boolean; onSuccess: () => void; onOverlap: (message: string) => void };

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
  /**
   * 편집에서 바뀐 필드만 넘긴다. 저장되면 onSuccess, 다른 강의와 시간이 겹치면 onOverlap 에 서버 문구를 준다.
   * 확인받으면 force 로 다시 부른다 (겹치는 강의를 빼고 고친다)
   */
  onSave: (change: Partial<CustomLectureInput>, options: SaveOptions) => void;
  onRemove: () => void;
};

/**
 * 강의 상세 (Figma `강의 상세`). 목록 옆에 열린다.
 * `강의편집` 을 누르면 같은 자리에서 필드가 입력칸으로 바뀐다 (detail.editing). 수강 정보는 고칠 수 없다.
 * 지도에서 보기는 6-3, 강의평 쪽은 8-4 에서 채운다.
 */
export function LectureDetailPanel({
  detail,
  lecture,
  semester,
  palette,
  onChange,
  onClose,
  onColorChange,
  onSave,
  onRemove,
}: LectureDetailPanelProps) {
  const setEditing = (editing: boolean) => onChange({ ...detail, editing });
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

      {detail.view === 'review' ? (
        <p className="px-6.5 pt-6.75 text-14-regular text-assistive">강의평 (8-4)</p>
      ) : detail.editing ? (
        <LectureEditForm
          lecture={lecture}
          palette={palette}
          onSave={(change, force, onOverlap) =>
            onSave(change, { force, onSuccess: () => setEditing(false), onOverlap })
          }
          onCancel={() => setEditing(false)}
        />
      ) : (
        <LectureInfo
          lecture={lecture}
          semester={semester}
          palette={palette}
          onColorChange={onColorChange}
          onEdit={() => setEditing(true)}
          onRemove={onRemove}
        />
      )}
    </PanelColumn>
  );
}

type LectureInfoProps = Pick<
  LectureDetailPanelProps,
  'lecture' | 'semester' | 'palette' | 'onColorChange' | 'onRemove'
> & { onEdit: () => void };

function LectureInfo({ lecture, semester, palette, onColorChange, onEdit, onRemove }: LectureInfoProps) {
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
          <CourseInfo lecture={lecture} />
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
          <a href={syllabusUrl} target="_blank" rel="noreferrer" onClick={openInPopup} className={ACTION_CLASSES}>
            강의계획서
            <IconArrowOutward className="size-5" />
          </a>
        )}
        <button type="button" onClick={onEdit} className={ACTION_CLASSES}>
          강의편집
        </button>
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

/** 수강편람의 수강 정보. 편집 중에도 고칠 수 없다 */
function CourseInfo({ lecture }: { lecture: TimetableLecture }) {
  return (
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
  );
}

type EditErrors = { title?: string; credit?: string; time?: string | null };

type LectureEditFormProps = Pick<LectureDetailPanelProps, 'lecture' | 'palette'> & {
  onSave: (change: Partial<CustomLectureInput>, force: boolean, onOverlap: (message: string) => void) => void;
  onCancel: () => void;
};

const isSameClassTimes = (a: readonly ClassTime[], b: readonly ClassTime[]) =>
  a.length === b.length &&
  a.every(
    (time, i) =>
      time.day === b[i].day &&
      time.startMinute === b[i].startMinute &&
      time.endMinute === b[i].endMinute &&
      time.place === b[i].place,
  );

/**
 * 강의 편집 (Figma `강의상세` 의 편집 상태). 상세와 같은 자리에서 강의명 · 교수 · 색상 · 비고 · 시간 및 장소가 입력칸으로 바뀐다.
 * 직접 추가한 강의는 학점도 고친다. 저장하면 바뀐 필드만 넘기고(CLAUDE.md "API 층"), 바뀐 것이 없으면 그냥 닫는다.
 * 다른 강의와 시간이 겹치면 검색에서 담을 때처럼 덮어쓸지 묻는다.
 * 저장 · 취소 버튼, 시간 줄의 모양은 Figma 에 없어 직접 추가 폼을 따른다 (디자인 문의 4-14)
 */
function LectureEditForm({ lecture, palette, onSave, onCancel }: LectureEditFormProps) {
  const id = useId();
  const custom = isCustomLecture(lecture);
  const [title, setTitle] = useState(lecture.title);
  const [instructor, setInstructor] = useState(lecture.instructor ?? '');
  const [credit, setCredit] = useState(lecture.credit?.toString() ?? '');
  const [color, setColor] = useState(lecture.color);
  const [remark, setRemark] = useState(lecture.remark ?? '');
  const [rows, setRows] = useState<TimeRow[]>(() => toTimeRows(lecture.classTimes));
  const [errors, setErrors] = useState<EditErrors>({});
  // 시간이 겹쳐서 덮어쓸지 묻는 중인 변경
  const [overlap, setOverlap] = useState<{ change: Partial<CustomLectureInput>; message: string } | null>(null);
  const save = (change: Partial<CustomLectureInput>, force = false) =>
    onSave(change, force, (message) => setOverlap({ change, message }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const classTimes = toClassTimes(rows);
    const timesChanged = !isSameClassTimes(classTimes, lecture.classTimes);
    const next: EditErrors = {};
    if (!title.trim()) next.title = '강의명을 입력하세요';
    if (custom && credit.trim() && !/^\d+$/.test(credit.trim())) next.credit = '학점은 숫자로 입력하세요';
    // 입력한 시간끼리만 본다. 다른 강의와 겹치는지는 서버가 알려 준다
    if (timesChanged) next.time = getClassTimeError(classTimes, []);
    setErrors(next);
    if (next.title || next.credit || next.time) return;

    const change: Partial<CustomLectureInput> = {};
    if (title.trim() !== lecture.title) change.title = title.trim();
    if ((instructor.trim() || null) !== lecture.instructor) change.instructor = instructor.trim() || null;
    const nextCredit = credit.trim() ? Number(credit.trim()) : null;
    if (custom && nextCredit !== lecture.credit) change.credit = nextCredit;
    if ((remark.trim() || null) !== lecture.remark) change.remark = remark.trim() || null;
    if (timesChanged) change.classTimes = classTimes;
    if (!isSameLectureColor(color, lecture.color)) change.color = color;

    if (Object.keys(change).length === 0) onCancel();
    else save(change);
  };

  return (
    <form
      noValidate
      aria-label="강의 편집"
      onSubmit={handleSubmit}
      className="mt-6.75 flex flex-col gap-5 pr-8 pb-3.75 pl-6.5"
    >
      {/* Figma: 입력칸은 높이 28 이라 줄 사이를 상세(15)보다 줄였다 */}
      <div className="flex flex-col gap-2.5">
        <EditRow id={`${id}-title`} label="강의명" error={errors.title}>
          <TextField
            id={`${id}-title`}
            variant="filled"
            // 아래쪽의 강의편집을 눌러 들어오므로, 첫 칸으로 포커스와 스크롤을 옮긴다
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? `${id}-title-error` : undefined}
          />
        </EditRow>
        <EditRow id={`${id}-instructor`} label="교수">
          <TextField
            id={`${id}-instructor`}
            variant="filled"
            placeholder="(없음)"
            value={instructor}
            onChange={(event) => setInstructor(event.target.value)}
          />
        </EditRow>
        {custom && (
          <EditRow id={`${id}-credit`} label="학점" error={errors.credit}>
            <TextField
              id={`${id}-credit`}
              variant="filled"
              inputMode="numeric"
              placeholder="(없음)"
              value={credit}
              onChange={(event) => setCredit(event.target.value)}
              aria-invalid={errors.credit ? true : undefined}
              aria-describedby={errors.credit ? `${id}-credit-error` : undefined}
            />
          </EditRow>
        )}
        <EditRow id={`${id}-color`} label="색상">
          <ColorSelect id={`${id}-color`} variant="compact" palette={palette} value={color} onValueChange={setColor} />
        </EditRow>
      </div>

      {!custom && (
        <>
          <Divider />
          <CourseInfo lecture={lecture} />
        </>
      )}

      <Divider />
      <InfoSection title="비고" labelFor={`${id}-remark`}>
        <TextArea
          id={`${id}-remark`}
          variant="filled"
          placeholder="(없음)"
          value={remark}
          onChange={(event) => setRemark(event.target.value)}
        />
      </InfoSection>

      <Divider />
      <InfoSection title="시간 및 장소">
        <ClassTimeFields
          id={id}
          rows={rows}
          onRowsChange={setRows}
          // 원래 시간이 없던 강의(원격 수업 등)는 줄을 모두 지울 수 있다
          minRows={lecture.classTimes.length > 0 ? 1 : 0}
          error={errors.time}
          // 시간 · 장소 라벨은 다른 줄(80)보다 좁다. 넓히면 시간 선택칸이 좁아 `오후 12:00` 이 잘린다
          variant="filled"
        />
      </InfoSection>

      <Divider />
      {/* 직접 추가 폼의 버튼: 116 × 38, 사이 8 */}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" className="w-29" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" className="w-29">
          저장
        </Button>
      </div>

      <ConfirmDialog
        open={overlap !== null}
        onOpenChange={(open) => !open && setOverlap(null)}
        message={overlap?.message}
        onConfirm={() => overlap && save(overlap.change, true)}
      />
    </form>
  );
}

type EditRowProps = { id: string; label: string; error?: string; children: ReactNode };

/** 상세의 InfoRow 와 같은 배치(라벨 80, 사이 20)에 입력칸을 둔다 */
function EditRow({ id, label, error, children }: EditRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex min-h-7 items-center gap-5">
        <label htmlFor={id} className="w-20 shrink-0 text-14-regular text-alternative">
          {label}
        </label>
        <div className="flex min-w-0 flex-1">{children}</div>
      </div>
      {error && (
        <p id={`${id}-error`} className="pl-25 text-13-regular text-warning">
          {error}
        </p>
      )}
    </div>
  );
}

const ACTION_CLASSES = clsx(
  'flex h-7.5 items-center gap-3.75 rounded-sm text-15-semibold text-plain',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snutt-mint',
);

type InfoSectionProps = {
  title: string;
  /** 편집에서 소제목이 입력칸 하나의 이름일 때 (비고) */
  labelFor?: string;
  children: ReactNode;
};

function InfoSection({ title, labelFor, children }: InfoSectionProps) {
  const id = useId();
  return (
    // Figma: 소제목과 내용 사이 15
    <section aria-labelledby={id} className="flex flex-col gap-3.75">
      <h3 id={id} className="text-15-semibold text-plain">
        {labelFor ? <label htmlFor={labelFor}>{title}</label> : title}
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
