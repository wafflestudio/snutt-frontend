import { type DayTimeRange } from './time';
import { getGridRange, type GridRange } from './grid-layout';

/**
 * 시간표 설정 (Figma `더보기_시간표 설정`). 서버에 없는 이 브라우저의 설정이다.
 * 기본값은 설정 화면이 생기기 전의 화면과 같게 두었다 (디자인 문의 4-32).
 */
export type TimetableSettings = {
  /** 켜면 그리드를 강의가 있는 시간에 맞춘다. 끄면 9 ~ 22시를 늘 보여 준다(벗어나는 강의가 있으면 넓힌다) */
  autoFit: boolean;
  /** 강의 블록에 보여 줄 것 */
  display: LectureBlockDisplay;
};

export type LectureBlockDisplay = { title: boolean; place: boolean; lectureNumber: boolean; instructor: boolean };

export const DEFAULT_TIMETABLE_SETTINGS: TimetableSettings = {
  autoFit: false,
  display: { title: true, place: true, lectureNumber: false, instructor: false },
};

/** 시간표에 그릴 범위. 자동 맞춤이면 강의의 처음 ~ 끝 정시에 맞추고, 강의가 없으면 기본 범위를 쓴다 */
export const getTimetableRange = (
  times: readonly DayTimeRange[],
  { autoFit }: Pick<TimetableSettings, 'autoFit'>,
): GridRange =>
  autoFit && times.length > 0 ? getGridRange(times, { startHour: 24, endHour: 0 }) : getGridRange(times);
