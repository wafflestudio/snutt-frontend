import { describe, expect, it } from '@jest/globals';

import { AmPm } from '@/entities/time';

import { getHourMinutePickerService } from './hourMinutePickerService';
import { getHourMinuteService } from './hourMinuteService';

const hourMinutePickerService = getHourMinutePickerService({ services: [getHourMinuteService()] });

describe('hourMinutePickerService', () => {
  describe('getAmPmList', () => {
    it('range 가 주어지지 않았을 때 모든 목록이 보인다', () => {
      expect(hourMinutePickerService.getAmPmList({}, {})).toStrictEqual([
        { value: AmPm.AM, label: '오전', disabled: false },
        { value: AmPm.PM, label: '오후', disabled: false },
      ]);
    });

    it('오전이 포함되지 않은 range 일 경우 오전이 disable된다', () => {
      expect(
        hourMinutePickerService.getAmPmList(
          {},
          { range: { start: { hour: 12, minute: 0 }, end: { hour: 19, minute: 20 } } },
        ),
      ).toStrictEqual([
        { value: AmPm.AM, label: '오전', disabled: true },
        { value: AmPm.PM, label: '오후', disabled: false },
      ]);
    });

    it('오후가 포함되지 않은 range 일 경우 오후가 disable된다', () => {
      expect(
        hourMinutePickerService.getAmPmList(
          {},
          { range: { start: { hour: 7, minute: 0 }, end: { hour: 11, minute: 55 } } },
        ),
      ).toStrictEqual([
        { value: AmPm.AM, label: '오전', disabled: false },
        { value: AmPm.PM, label: '오후', disabled: true },
      ]);
    });
  });

  describe('getHourList', () => {
    it('아무것도 주어지지 않았을 때 모든 목록이 disabled로 보인다', () => {
      expect(hourMinutePickerService.getHourList({}, {})).toStrictEqual([
        { label: 12, degree: 0, value: 0, disabled: true },
        { label: 1, degree: 30, value: 1, disabled: true },
        { label: 2, degree: 60, value: 2, disabled: true },
        { label: 3, degree: 90, value: 3, disabled: true },
        { label: 4, degree: 120, value: 4, disabled: true },
        { label: 5, degree: 150, value: 5, disabled: true },
        { label: 6, degree: 180, value: 6, disabled: true },
        { label: 7, degree: 210, value: 7, disabled: true },
        { label: 8, degree: 240, value: 8, disabled: true },
        { label: 9, degree: 270, value: 9, disabled: true },
        { label: 10, degree: 300, value: 10, disabled: true },
        { label: 11, degree: 330, value: 11, disabled: true },
      ]);
    });

    it('range가 주어지지 않았을 때 모든 목록이 enabled로 보인다', () => {
      expect(hourMinutePickerService.getHourList({}, { defaultHourMinute: { hour: 12, minute: 0 } })).toStrictEqual([
        { label: 12, degree: 0, value: 0, disabled: false },
        { label: 1, degree: 30, value: 1, disabled: false },
        { label: 2, degree: 60, value: 2, disabled: false },
        { label: 3, degree: 90, value: 3, disabled: false },
        { label: 4, degree: 120, value: 4, disabled: false },
        { label: 5, degree: 150, value: 5, disabled: false },
        { label: 6, degree: 180, value: 6, disabled: false },
        { label: 7, degree: 210, value: 7, disabled: false },
        { label: 8, degree: 240, value: 8, disabled: false },
        { label: 9, degree: 270, value: 9, disabled: false },
        { label: 10, degree: 300, value: 10, disabled: false },
        { label: 11, degree: 330, value: 11, disabled: false },
      ]);
    });

    it('range가 주어졌을 때 적절하게 보인다 (오전)', () => {
      expect(
        hourMinutePickerService.getHourList(
          {},
          {
            range: { start: { hour: 8, minute: 30 }, end: { hour: 13, minute: 0 } },
            defaultHourMinute: { hour: 11, minute: 0 },
          },
        ),
      ).toStrictEqual([
        { label: 12, degree: 0, value: 0, disabled: true },
        { label: 1, degree: 30, value: 1, disabled: true },
        { label: 2, degree: 60, value: 2, disabled: true },
        { label: 3, degree: 90, value: 3, disabled: true },
        { label: 4, degree: 120, value: 4, disabled: true },
        { label: 5, degree: 150, value: 5, disabled: true },
        { label: 6, degree: 180, value: 6, disabled: true },
        { label: 7, degree: 210, value: 7, disabled: true },
        { label: 8, degree: 240, value: 8, disabled: false },
        { label: 9, degree: 270, value: 9, disabled: false },
        { label: 10, degree: 300, value: 10, disabled: false },
        { label: 11, degree: 330, value: 11, disabled: false },
      ]);
    });

    it('range가 주어졌을 때 적절하게 보인다 (오후)', () => {
      expect(
        hourMinutePickerService.getHourList(
          {},
          {
            range: { start: { hour: 8, minute: 30 }, end: { hour: 13, minute: 0 } },
            defaultHourMinute: { hour: 14, minute: 0 },
          },
        ),
      ).toStrictEqual([
        { label: 12, degree: 0, value: 0, disabled: false },
        { label: 1, degree: 30, value: 1, disabled: false },
        { label: 2, degree: 60, value: 2, disabled: true },
        { label: 3, degree: 90, value: 3, disabled: true },
        { label: 4, degree: 120, value: 4, disabled: true },
        { label: 5, degree: 150, value: 5, disabled: true },
        { label: 6, degree: 180, value: 6, disabled: true },
        { label: 7, degree: 210, value: 7, disabled: true },
        { label: 8, degree: 240, value: 8, disabled: true },
        { label: 9, degree: 270, value: 9, disabled: true },
        { label: 10, degree: 300, value: 10, disabled: true },
        { label: 11, degree: 330, value: 11, disabled: true },
      ]);
    });
  });

  describe('getMinuteList', () => {
    it('아무것도 주어지지 않았을 때 모든 목록이 enabled 로 보인다', () => {
      expect(hourMinutePickerService.getMinuteList({}, {})).toStrictEqual([
        { label: 0, degree: 0, value: 0, disabled: true },
        { label: 5, degree: 30, value: 5, disabled: true },
        { label: 10, degree: 60, value: 10, disabled: true },
        { label: 15, degree: 90, value: 15, disabled: true },
        { label: 20, degree: 120, value: 20, disabled: true },
        { label: 25, degree: 150, value: 25, disabled: true },
        { label: 30, degree: 180, value: 30, disabled: true },
        { label: 35, degree: 210, value: 35, disabled: true },
        { label: 40, degree: 240, value: 40, disabled: true },
        { label: 45, degree: 270, value: 45, disabled: true },
        { label: 50, degree: 300, value: 50, disabled: true },
        { label: 55, degree: 330, value: 55, disabled: true },
      ]);
    });

    it('range 가 없을 때 전체가 enable된다', () => {
      expect(hourMinutePickerService.getMinuteList({}, { defaultHourMinute: { hour: 13, minute: 0 } })).toStrictEqual([
        { label: 0, degree: 0, value: 0, disabled: false },
        { label: 5, degree: 30, value: 5, disabled: false },
        { label: 10, degree: 60, value: 10, disabled: false },
        { label: 15, degree: 90, value: 15, disabled: false },
        { label: 20, degree: 120, value: 20, disabled: false },
        { label: 25, degree: 150, value: 25, disabled: false },
        { label: 30, degree: 180, value: 30, disabled: false },
        { label: 35, degree: 210, value: 35, disabled: false },
        { label: 40, degree: 240, value: 40, disabled: false },
        { label: 45, degree: 270, value: 45, disabled: false },
        { label: 50, degree: 300, value: 50, disabled: false },
        { label: 55, degree: 330, value: 55, disabled: false },
      ]);
    });

    it('range 에 포함될 때 전체가 enable된다', () => {
      expect(
        hourMinutePickerService.getMinuteList(
          { hour: 1, amPm: AmPm.PM },
          { range: { start: { hour: 12, minute: 0 }, end: { hour: 14, minute: 0 } } },
        ),
      ).toStrictEqual([
        { label: 0, degree: 0, value: 0, disabled: false },
        { label: 5, degree: 30, value: 5, disabled: false },
        { label: 10, degree: 60, value: 10, disabled: false },
        { label: 15, degree: 90, value: 15, disabled: false },
        { label: 20, degree: 120, value: 20, disabled: false },
        { label: 25, degree: 150, value: 25, disabled: false },
        { label: 30, degree: 180, value: 30, disabled: false },
        { label: 35, degree: 210, value: 35, disabled: false },
        { label: 40, degree: 240, value: 40, disabled: false },
        { label: 45, degree: 270, value: 45, disabled: false },
        { label: 50, degree: 300, value: 50, disabled: false },
        { label: 55, degree: 330, value: 55, disabled: false },
      ]);
    });

    it('range 에 뒤쪽이 걸치면 뒤쪽만 disable된다', () => {
      expect(
        hourMinutePickerService.getMinuteList(
          { hour: 1, amPm: AmPm.PM },
          { range: { start: { hour: 12, minute: 0 }, end: { hour: 13, minute: 10 } } },
        ),
      ).toStrictEqual([
        { label: 0, degree: 0, value: 0, disabled: false },
        { label: 5, degree: 30, value: 5, disabled: false },
        { label: 10, degree: 60, value: 10, disabled: false },
        { label: 15, degree: 90, value: 15, disabled: true },
        { label: 20, degree: 120, value: 20, disabled: true },
        { label: 25, degree: 150, value: 25, disabled: true },
        { label: 30, degree: 180, value: 30, disabled: true },
        { label: 35, degree: 210, value: 35, disabled: true },
        { label: 40, degree: 240, value: 40, disabled: true },
        { label: 45, degree: 270, value: 45, disabled: true },
        { label: 50, degree: 300, value: 50, disabled: true },
        { label: 55, degree: 330, value: 55, disabled: true },
      ]);
    });

    it('range 에 양쪽이 걸치면 양쪽 다 disable된다', () => {
      expect(
        hourMinutePickerService.getMinuteList(
          { hour: 1, amPm: AmPm.PM },
          { range: { start: { hour: 13, minute: 5 }, end: { hour: 13, minute: 10 } } },
        ),
      ).toStrictEqual([
        { label: 0, degree: 0, value: 0, disabled: true },
        { label: 5, degree: 30, value: 5, disabled: false },
        { label: 10, degree: 60, value: 10, disabled: false },
        { label: 15, degree: 90, value: 15, disabled: true },
        { label: 20, degree: 120, value: 20, disabled: true },
        { label: 25, degree: 150, value: 25, disabled: true },
        { label: 30, degree: 180, value: 30, disabled: true },
        { label: 35, degree: 210, value: 35, disabled: true },
        { label: 40, degree: 240, value: 40, disabled: true },
        { label: 45, degree: 270, value: 45, disabled: true },
        { label: 50, degree: 300, value: 50, disabled: true },
        { label: 55, degree: 330, value: 55, disabled: true },
      ]);
    });
  });

  describe('getUpdatedStateOnAmPmChange', () => {
    it('range가 없을 경우 amPm만 변경된다', () => {
      expect(hourMinutePickerService.getUpdatedStateOnAmPmChange({ hour: 1, minute: 10 }, {}, AmPm.PM)).toStrictEqual({
        amPm: AmPm.PM,
        hour: 1,
        minute: 10,
      });
    });

    it('변경해도 range 를 벗어나지 않을 경우 amPm만 변경된다', () => {
      expect(
        hourMinutePickerService.getUpdatedStateOnAmPmChange(
          { hour: 0, minute: 10 },
          { range: { start: { hour: 8, minute: 0 }, end: { hour: 21, minute: 0 } } },
          AmPm.PM,
        ),
      ).toStrictEqual({ amPm: AmPm.PM, hour: 0, minute: 10 });
    });

    it('변경해서 range 보다 늦어질 경우 range.end 로 고정된다', () => {
      expect(
        hourMinutePickerService.getUpdatedStateOnAmPmChange(
          { hour: 1, minute: 10 },
          { range: { start: { hour: 8, minute: 0 }, end: { hour: 12, minute: 30 } } },
          AmPm.PM,
        ),
      ).toStrictEqual({ amPm: AmPm.PM, hour: 0, minute: 30 });
    });

    it('변경해서 range 보다 빨라질 경우 range.start 로 고정된다', () => {
      expect(
        hourMinutePickerService.getUpdatedStateOnAmPmChange(
          { hour: 1, minute: 10 },
          { range: { start: { hour: 8, minute: 0 }, end: { hour: 12, minute: 30 } } },
          AmPm.AM,
        ),
      ).toStrictEqual({ amPm: AmPm.AM, hour: 8, minute: 0 });
    });
  });

  describe('getUpdatedStateOnHourChange', () => {
    it('range가 없을 경우 hour만 변경된다', () => {
      expect(hourMinutePickerService.getUpdatedStateOnHourChange({ amPm: AmPm.AM, minute: 10 }, {}, 8)).toStrictEqual({
        amPm: AmPm.AM,
        hour: 8,
        minute: 10,
      });
    });

    it('변경해도 range 를 벗어나지 않을 경우 hour만 변경된다', () => {
      expect(
        hourMinutePickerService.getUpdatedStateOnHourChange(
          { amPm: AmPm.PM, minute: 10 },
          { range: { start: { hour: 8, minute: 0 }, end: { hour: 21, minute: 0 } } },
          4,
        ),
      ).toStrictEqual({ amPm: AmPm.PM, hour: 4, minute: 10 });
    });

    it('변경해서 range 보다 늦어질 경우 range.end 로 고정된다', () => {
      expect(
        hourMinutePickerService.getUpdatedStateOnHourChange(
          { amPm: AmPm.PM, minute: 50 },
          { range: { start: { hour: 8, minute: 0 }, end: { hour: 12, minute: 30 } } },
          0,
        ),
      ).toStrictEqual({ amPm: AmPm.PM, hour: 0, minute: 30 });
    });

    it('변경해서 range 보다 빨라질 경우 range.start 로 고정된다', () => {
      expect(
        hourMinutePickerService.getUpdatedStateOnHourChange(
          { amPm: AmPm.AM, minute: 10 },
          { range: { start: { hour: 8, minute: 0 }, end: { hour: 12, minute: 30 } } },
          7,
        ),
      ).toStrictEqual({ amPm: AmPm.AM, hour: 8, minute: 0 });
    });
  });

  describe('getSubmitHourMinute', () => {
    it('안 수정되었을 경우', () => {
      expect(
        hourMinutePickerService.getSubmitHourMinute({}, { defaultHourMinute: { hour: 13, minute: 30 } }),
      ).toStrictEqual({ hour: 13, minute: 30 });
    });

    it('오전오후만 수정되었을 경우', () => {
      expect(
        hourMinutePickerService.getSubmitHourMinute({ amPm: AmPm.AM }, { defaultHourMinute: { hour: 13, minute: 30 } }),
      ).toStrictEqual({ hour: 1, minute: 30 });
    });

    it('시만 수정되었을 경우', () => {
      expect(
        hourMinutePickerService.getSubmitHourMinute({ hour: 8 }, { defaultHourMinute: { hour: 0, minute: 30 } }),
      ).toStrictEqual({ hour: 8, minute: 30 });
    });

    it('분만 수정되었을 경우', () => {
      expect(
        hourMinutePickerService.getSubmitHourMinute({ minute: 0 }, { defaultHourMinute: { hour: 13, minute: 30 } }),
      ).toStrictEqual({ hour: 13, minute: 0 });
    });

    it('오전오후, 시만 수정되었을 경우', () => {
      expect(
        hourMinutePickerService.getSubmitHourMinute(
          { amPm: AmPm.AM, hour: 9 },
          { defaultHourMinute: { hour: 13, minute: 30 } },
        ),
      ).toStrictEqual({ hour: 9, minute: 30 });
    });

    it('모두 수정되었을 경우', () => {
      expect(
        hourMinutePickerService.getSubmitHourMinute(
          { amPm: AmPm.PM, hour: 8, minute: 15 },
          { defaultHourMinute: { hour: 0, minute: 30 } },
        ),
      ).toStrictEqual({ hour: 20, minute: 15 });
    });
  });

  describe('getAmPmWithDefault', () => {
    it('둘다 없을 경우', () => {
      expect(hourMinutePickerService.getAmPmWithDefault(undefined, undefined)).toStrictEqual(undefined);
    });

    it('amPm만 있을 경우', () => {
      expect(hourMinutePickerService.getAmPmWithDefault(AmPm.AM, undefined)).toStrictEqual(AmPm.AM);
    });

    it('디폴트만 있을 경우', () => {
      expect(hourMinutePickerService.getAmPmWithDefault(undefined, { hour: 13, minute: 0 })).toStrictEqual(AmPm.PM);
    });

    it('둘다 있을 경우', () => {
      expect(hourMinutePickerService.getAmPmWithDefault(AmPm.AM, { hour: 13, minute: 0 })).toStrictEqual(AmPm.AM);
    });
  });

  describe('getHour12WithDefault', () => {
    it('둘다 없을 경우', () => {
      expect(hourMinutePickerService.getHour12WithDefault(undefined, undefined)).toStrictEqual(undefined);
    });

    it('amPm만 있을 경우', () => {
      expect(hourMinutePickerService.getHour12WithDefault(3, undefined)).toStrictEqual(3);
    });

    it('디폴트만 있을 경우', () => {
      expect(hourMinutePickerService.getHour12WithDefault(undefined, { hour: 13, minute: 0 })).toStrictEqual(1);
    });

    it('둘다 있을 경우', () => {
      expect(hourMinutePickerService.getHour12WithDefault(0, { hour: 13, minute: 0 })).toStrictEqual(0);
    });
  });

  describe('getMinuteWithDefault', () => {
    it('둘다 없을 경우', () => {
      expect(hourMinutePickerService.getMinuteWithDefault(undefined, undefined)).toStrictEqual(undefined);
    });

    it('amPm만 있을 경우', () => {
      expect(hourMinutePickerService.getMinuteWithDefault(5, undefined)).toStrictEqual(5);
    });

    it('디폴트만 있을 경우', () => {
      expect(hourMinutePickerService.getMinuteWithDefault(undefined, { hour: 13, minute: 0 })).toStrictEqual(0);
    });

    it('둘다 있을 경우', () => {
      expect(hourMinutePickerService.getMinuteWithDefault(0, { hour: 13, minute: 10 })).toStrictEqual(0);
    });
  });
});
