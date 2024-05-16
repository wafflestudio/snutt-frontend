// 요일
export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const DAY_LABEL_MAP = { 0: '월', 1: '화', 2: '수', 3: '목', 4: '금', 5: '토', 6: '일' };
export const dayList: Day[] = [0, 1, 2, 3, 4, 5, 6];

// 시간
export type Hour12 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type Hour24 = Hour12 | (12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23);
export type Minute = 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55;

// 오전/오후
export enum AmPm {
  AM = 'a.m',
  PM = 'p.m',
}

// 시 + 분
export type HourMinute24 = { hour: Hour24; minute: Minute };
export type HourMinute12 = { amPm: AmPm; hour: Hour12; minute: Minute };
export type HourMinute = HourMinute12 | HourMinute24;
