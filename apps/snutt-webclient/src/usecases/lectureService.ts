import type { Color } from '@/entities/color';
import type { WithInternalId } from '@/entities/id';
import type { BaseLecture, ClassTime, Lecture } from '@/entities/lecture';
import type { CourseBook } from '@/entities/semester';
import { DAY_LABEL_MAP } from '@/entities/time';
import { createRandomId } from '@/utils/random-id';

export interface LectureService {
  getLectureDetailUrl(lecture: BaseLecture, courseBook: Omit<CourseBook, 'updatedAt'>): string;
  getLectureTimeTexts(lecture: BaseLecture): string[];
  getLectureColor(lecture: Pick<Lecture, 'color' | 'colorIndex'>, colorList: Color[]): Color;
  getEmptyClassTime(): WithInternalId<ClassTime>;
  appendInternalId(time: ClassTime): WithInternalId<ClassTime>;
  removeInternalId(time: WithInternalId<ClassTime>): ClassTime;
  isCustomLecture(lecture: BaseLecture): boolean;
}

export const getLectureService = (): LectureService => {
  return {
    getLectureDetailUrl: ({ course_number, lecture_number }, { year, semester }) => {
      const { openShtmFg, openDetaShtmFg } = {
        1: { openShtmFg: 'U000200001', openDetaShtmFg: 'U000300001' },
        2: { openShtmFg: 'U000200001', openDetaShtmFg: 'U000300002' },
        3: { openShtmFg: 'U000200002', openDetaShtmFg: 'U000300001' },
        4: { openShtmFg: 'U000200002', openDetaShtmFg: 'U000300002' },
      }[semester];

      return `http://libproxy.snu.ac.kr/_Lib_Proxy_Url/https://sugang.snu.ac.kr/sugang/cc/cc103.action?openSchyy=${year}&openShtmFg=${openShtmFg}&openDetaShtmFg=${openDetaShtmFg}&sbjtCd=${course_number}&ltNo=${lecture_number}&sbjtSubhCd=000`;
    },
    getLectureTimeTexts: (lecture) =>
      lecture.class_time_json.map((t) => {
        const startHour = String(Math.floor(t.startMinute / 60)).padStart(2, '0');
        const startMinute = String(t.startMinute % 60).padStart(2, '0');
        const endHour = String(Math.floor(t.endMinute / 60)).padStart(2, '0');
        const endMinute = String(t.endMinute % 60).padStart(2, '0');

        return `${DAY_LABEL_MAP[t.day]}(${startHour}:${startMinute}~${endHour}:${endMinute})`;
      }),
    getLectureColor: (lecture, colorList) => {
      const fallback = { bg: '#94e6fe', fg: '#1579c2' };

      if (lecture.colorIndex === 0) return { bg: lecture.color.bg ?? fallback.bg, fg: lecture.color.fg ?? fallback.fg };

      const bg = colorList?.[lecture.colorIndex - 1]?.bg ?? fallback.bg;
      const fg = colorList?.[lecture.colorIndex - 1]?.fg ?? fallback.fg;

      return { bg, fg };
    },
    getEmptyClassTime: () => ({ day: 0, startMinute: 480, endMinute: 510, place: '', __id__: createRandomId() }),
    appendInternalId: (item) => ({ ...item, __id__: createRandomId() }),
    removeInternalId: ({ __id__, ...time }) => time,
    isCustomLecture: (lecture) => lecture.lecture_id == undefined,
  };
};
