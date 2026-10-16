import type { ReactNode } from 'react';
import { getClassTimeSummary, getPlaceSummary, getSyllabusUrl, type Lecture } from '@/domain/lecture';
import { IconButton } from '@/shared/ui/IconButton';
import {
  IconAdd,
  IconArrowOutward,
  IconBookmarkFill,
  IconLocationFill,
  IconMoreHorizontal,
  IconRemove,
  IconScheduleFill,
  IconStarFill,
  IconTagFill,
} from '@/shared/ui/icons';

type LectureCellProps = {
  lecture: Lecture;
  /** 고른 시간표에 담겨 있으면 `+` 대신 `−` 를 보여 준다 */
  added: boolean;
  bookmarked: boolean;
  /** 담을 시간표가 없으면 담기 버튼을 누를 수 없다 */
  canAdd: boolean;
  onAddToggle: () => void;
  onBookmarkToggle: () => void;
  /** 커서를 올리거나 안의 버튼에 포커스가 가면 true, 벗어나면 false (시간표 미리보기, 5-2) */
  onPreviewChange?: (previewing: boolean) => void;
};

/**
 * 강의 한 줄 (Figma `cell`). 검색 결과에 쓰고, 관심강좌(7-1) · 강의 목록(7-2)에서도 쓴다.
 * Figma: 폭은 목록을 채우고, 여백 10, 왼쪽 정보와 오른쪽 버튼 사이 20, 아래 선 Line/light.
 * 회색 배경 변형은 커서를 올렸을 때로 쓴다 (디자인 문의 4-11)
 */
export function LectureCell({
  lecture,
  added,
  bookmarked,
  canAdd,
  onAddToggle,
  onBookmarkToggle,
  onPreviewChange,
}: LectureCellProps) {
  const syllabusUrl = getSyllabusUrl(lecture, lecture.semester);
  const department = [lecture.department, lecture.academicYear].filter(Boolean).join(', ');

  return (
    <article
      aria-label={lecture.title}
      className="flex gap-5 border-b border-line-light bg-normal p-2.5 transition-colors hover:bg-light-field"
      onMouseEnter={() => onPreviewChange?.(true)}
      onMouseLeave={() => onPreviewChange?.(false)}
      onFocus={() => onPreviewChange?.(true)}
      // 안의 다른 버튼으로 포커스가 옮겨 갈 때는 그대로 둔다
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && onPreviewChange?.(false)}
    >
      {/* Figma: 강의명과 나머지 사이 1, 교수 줄과 정보 줄 사이 8 */}
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <h3 className="text-15-bold break-keep text-normal">{lecture.title}</h3>
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 text-13-regular">
            <span className="min-w-0 truncate text-normal">
              {lecture.instructor ?? '-'} / {lecture.credit}학점
            </span>
            <Rating evaluation={lecture.evaluation} />
          </p>
          {/* Figma: 줄 사이 6, 아이콘 13px */}
          <ul className="flex flex-col gap-1.5 text-13-regular text-plain">
            <InfoLine icon={<IconTagFill />} label="학과 · 학년">
              {department || null}
            </InfoLine>
            <InfoLine icon={<IconScheduleFill />} label="시간">
              {getClassTimeSummary(lecture)}
            </InfoLine>
            <InfoLine icon={<IconLocationFill />} label="장소">
              {getPlaceSummary(lecture)}
            </InfoLine>
            <InfoLine icon={<IconMoreHorizontal />} label="비고">
              {lecture.remark}
            </InfoLine>
          </ul>
        </div>
      </div>

      {/* Figma: 폭 81, 버튼은 위 · 강의계획서는 아래 */}
      <div className="flex w-20.25 shrink-0 flex-col items-end justify-between">
        <div className="flex gap-2.25">
          <IconButton
            variant="circle"
            label="관심강좌"
            aria-pressed={bookmarked}
            // Figma: 채운 책갈피 16px. 기본은 회색, 담으면 검정
            icon={<IconBookmarkFill className="size-4" />}
            onClick={onBookmarkToggle}
          />
          <IconButton
            variant="circle"
            label={added ? '시간표에서 빼기' : '시간표에 담기'}
            icon={added ? <IconRemove className="size-5.5" /> : <IconAdd className="size-5.5" />}
            disabled={!added && !canAdd}
            onClick={onAddToggle}
          />
        </div>
        {syllabusUrl && (
          // Figma: 높이 24, 여백 4 · 8, 둥글기 5, 화살표 8px
          <a
            href={syllabusUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-6 items-center gap-0.5 rounded-[5px] px-2 text-13-medium whitespace-nowrap text-plain hover:bg-light focus-visible:outline-2 focus-visible:outline-snutt-mint"
          >
            강의계획서
            <IconArrowOutward className="size-2" />
          </a>
        )}
      </div>
    </article>
  );
}

/** `★ 4.0 (1)`. 강의평이 없으면 `★ - (0)` 을 흐리게 */
function Rating({ evaluation }: { evaluation: Lecture['evaluation'] }) {
  const rating = evaluation?.rating ?? null;
  return (
    <span
      aria-label={rating === null ? '강의평 없음' : `평점 ${rating.toFixed(1)}, 강의평 ${evaluation?.count}개`}
      className="flex shrink-0 items-center gap-0.5 text-assistive"
    >
      <IconStarFill className={rating === null ? 'size-3.25' : 'size-3.25 text-snutt-yellow'} />
      <span className={rating === null ? undefined : 'text-plain'}>
        {rating === null ? '-' : rating.toFixed(1)} ({evaluation?.count ?? 0})
      </span>
    </span>
  );
}

/** 아이콘과 한 줄. 값이 없으면 `-` (Figma) */
function InfoLine({ icon, label, children }: { icon: ReactNode; label: string; children: string | null }) {
  return (
    <li className="flex min-w-0 items-center gap-2">
      <span aria-hidden className="shrink-0 text-med [&>svg]:size-3.25">
        {icon}
      </span>
      <span className="sr-only">{label}</span>
      <span className="truncate">{children ?? '-'}</span>
    </li>
  );
}
