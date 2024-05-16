import { describe, expect, it } from '@jest/globals';

import { AmPm } from '@/entities/time';

import { getHourMinuteService } from './hourMinuteService';

const hourMinuteService = getHourMinuteService();

describe('hourMinuteService', () => {
  describe('isAfter', () => {
    it('should return true when hm1 is after hm2', () => {
      const hm1 = { hour: 12, minute: 30 } as const;
      const hm2 = { hour: 10, minute: 15 } as const;
      expect(hourMinuteService.isAfter(hm1, hm2)).toBe(true);
    });

    it('should return false when hm1 is before hm2', () => {
      const hm1 = { hour: 8, minute: 0 } as const;
      const hm2 = { hour: 11, minute: 30 } as const;
      expect(hourMinuteService.isAfter(hm1, hm2)).toBe(false);
    });

    it('others', () => {
      const { isAfter } = hourMinuteService;
      expect(isAfter({ hour: 12, minute: 0 }, { hour: 9, minute: 0 })).toStrictEqual(true);
      expect(isAfter({ hour: 15, minute: 0 }, { hour: 18, minute: 5 })).toStrictEqual(false);
      expect(isAfter({ hour: 3, minute: 0 }, { hour: 5, minute: 5, amPm: AmPm.PM })).toStrictEqual(false);
      expect(isAfter({ hour: 7, minute: 0 }, { hour: 5, minute: 5, amPm: AmPm.AM })).toStrictEqual(true);
      expect(isAfter({ hour: 15, minute: 0 }, { hour: 3, minute: 0, amPm: AmPm.PM })).toStrictEqual(false);
    });
  });

  describe('isBefore', () => {
    it('should return true when hm1 is before hm2', () => {
      const hm1 = { hour: 6, minute: 45 } as const;
      const hm2 = { hour: 9, minute: 30 } as const;
      expect(hourMinuteService.isBefore(hm1, hm2)).toBe(true);
    });

    it('should return false when hm1 is after hm2', () => {
      const hm1 = { hour: 13, minute: 0 } as const;
      const hm2 = { hour: 12, minute: 45 } as const;
      expect(hourMinuteService.isBefore(hm1, hm2)).toBe(false);
    });
  });

  describe('max', () => {
    it('should return the maximum HourMinute value from the input', () => {
      const hm1 = { hour: 8, minute: 30 } as const;
      const hm2 = { hour: 7, minute: 45 } as const;
      const hm3 = { hour: 10, minute: 0 } as const;
      expect(hourMinuteService.max(hm1, hm2, hm3)).toEqual(hm3);
    });
  });

  describe('min', () => {
    it('should return the minimum HourMinute value from the input', () => {
      const hm1 = { hour: 4, minute: 15 } as const;
      const hm2 = { hour: 6, minute: 0 } as const;
      const hm3 = { hour: 5, minute: 30 } as const;
      expect(hourMinuteService.min(hm1, hm2, hm3)).toEqual(hm1);
    });
  });

  describe('toHour24', () => {
    it('should convert HourMinute12 to Hour24 correctly', () => {
      expect(hourMinuteService.toHour24(11, AmPm.AM)).toEqual(11);

      expect(hourMinuteService.toHour24(11, AmPm.PM)).toEqual(23);
    });
  });

  describe('toHourMinute24', () => {
    it('should convert HourMinute12 to HourMinute24 correctly', () => {
      const hm12 = { hour: 3, minute: 45, amPm: AmPm.PM } as const;
      expect(hourMinuteService.toHourMinute24(hm12)).toEqual({ hour: 15, minute: 45 });

      const hm24 = { hour: 17, minute: 30 } as const;
      expect(hourMinuteService.toHourMinute24(hm24)).toEqual(hm24);
    });
  });
});
