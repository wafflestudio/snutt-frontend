import { AmPm, type Hour12, type HourMinute12, type HourMinute24, type Minute } from '@/entities/time';

import { type HourMinuteService } from './hourMinuteService';

type State = Partial<HourMinute12>;

type Props = Partial<{
  range: { start: HourMinute24; end: HourMinute24 } | undefined;
  defaultHourMinute: HourMinute24 | undefined;
}>;

export interface HourMinutePickerService {
  getAmPmList: (
    state: Pick<State, never>,
    props: Pick<Props, 'range'>,
  ) => { value: AmPm; label: string; disabled: boolean }[];
  getHourList: (
    state: Pick<State, 'amPm'>,
    props: Pick<Props, 'range' | 'defaultHourMinute'>,
  ) => { label: number; degree: number; value: number; disabled: boolean }[];
  getMinuteList: (
    state: Pick<State, 'amPm' | 'hour'>,
    props: Pick<Props, 'range' | 'defaultHourMinute'>,
  ) => { label: number; degree: number; value: number; disabled: boolean }[];

  getUpdatedStateOnAmPmChange: (
    state: Pick<State, 'hour' | 'minute'>,
    props: Pick<Props, 'range' | 'defaultHourMinute'>,
    updatedAmPm: HourMinute12['amPm'],
  ) => State;
  getUpdatedStateOnHourChange: (
    state: Pick<State, 'amPm' | 'minute'>,
    props: Pick<Props, 'range' | 'defaultHourMinute'>,
    updatedHour: HourMinute12['hour'],
  ) => State;

  getSubmitHourMinute: (
    state: Pick<State, 'amPm' | 'hour' | 'minute'>,
    props: Pick<Props, 'defaultHourMinute'>,
  ) => HourMinute24 | null;

  getAmPmWithDefault: (amPm: AmPm | undefined, defaultHourMinute: HourMinute24 | undefined) => AmPm | undefined;
  getHour12WithDefault: (hour: Hour12 | undefined, defaultHourMinute: HourMinute24 | undefined) => Hour12 | undefined;
  getMinuteWithDefault: (minute: Minute | undefined, defaultHourMinute: HourMinute24 | undefined) => Minute | undefined;
}

type Deps = { services: [HourMinuteService] };
export const getHourMinutePickerService = ({ services }: Deps): HourMinutePickerService => {
  const getAmPmWithDefault = (amPm: AmPm | undefined, defaultHourMinute: HourMinute24 | undefined): AmPm | undefined =>
    amPm ?? (defaultHourMinute ? (defaultHourMinute.hour >= 12 ? AmPm.PM : AmPm.AM) : undefined);

  const getHour12WithDefault = (
    hour: Hour12 | undefined,
    defaultHourMinute: HourMinute24 | undefined,
  ): Hour12 | undefined => hour ?? (defaultHourMinute ? ((defaultHourMinute.hour % 12) as Hour12) : undefined);

  const getMinuteWithDefault = (
    minute: Minute | undefined,
    defaultHourMinute: HourMinute24 | undefined,
  ): Minute | undefined => minute ?? defaultHourMinute?.minute;

  return {
    getAmPmList: ({}, { range }) => {
      return [
        { value: AmPm.AM, label: '오전', disabled: !!range && range.start.hour >= 12 },
        { value: AmPm.PM, label: '오후', disabled: !!range && range.end.hour < 12 },
      ];
    },
    getHourList: ({ amPm }, { range, defaultHourMinute }) => {
      const amPmWithDefault = getAmPmWithDefault(amPm, defaultHourMinute);

      return ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map((h, i) => ({
        label: h === 0 ? 12 : h,
        degree: i * 30,
        value: h,
        disabled:
          amPmWithDefault === undefined ||
          (!!range &&
            (() => {
              const h24 = services[0].toHour24(h, amPmWithDefault);
              return h24 < range.start.hour || h24 > range.end.hour;
            })()),
      }));
    },
    getMinuteList: ({ amPm, hour }, { range, defaultHourMinute }) => {
      const amPmWithDefault = getAmPmWithDefault(amPm, defaultHourMinute);
      const hourWithDefault = getHour12WithDefault(hour, defaultHourMinute);

      return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m, i) => ({
        label: m,
        degree: i * 30,
        value: m,
        disabled:
          amPmWithDefault === undefined ||
          hourWithDefault === undefined ||
          (!!range &&
            (() => {
              const h24 = services[0].toHour24(hourWithDefault, amPmWithDefault);
              return (
                h24 < range.start.hour ||
                (h24 === range.start.hour && m < range.start.minute) ||
                h24 > range.end.hour ||
                (h24 === range.end.hour && m > range.end.minute)
              );
            })()),
      }));
    },
    getUpdatedStateOnAmPmChange: ({ hour, minute }, { range, defaultHourMinute }, updatedAmPm) => {
      const hourWithDefault = getHour12WithDefault(hour, defaultHourMinute);
      const minuteWithDefault = getMinuteWithDefault(minute, defaultHourMinute);

      if (!range) return { amPm: updatedAmPm, hour, minute };

      if (hourWithDefault === undefined || minuteWithDefault === undefined) {
        const minHourMinuteInAmPm =
          updatedAmPm === AmPm.AM ? ({ hour: 0, minute: 0 } as const) : ({ hour: 12, minute: 0 } as const);
        return services[0].toHourMinute12(services[0].min(minHourMinuteInAmPm, range.start));
      }

      const orgHourMinute: HourMinute12 = { amPm: updatedAmPm, hour: hourWithDefault, minute: minuteWithDefault };

      if (services[0].isAfter(orgHourMinute, range.end)) return services[0].toHourMinute12(range.end);

      if (services[0].isBefore(orgHourMinute, range.start)) return services[0].toHourMinute12(range.start);

      return { amPm: updatedAmPm, hour, minute };
    },
    getUpdatedStateOnHourChange: ({ amPm, minute }, { range, defaultHourMinute }, updatedHour) => {
      const amPmWithDefault = getAmPmWithDefault(amPm, defaultHourMinute);
      const minuteWithDefault = getMinuteWithDefault(minute, defaultHourMinute);

      if (!range) return { amPm, hour: updatedHour, minute };

      if (amPmWithDefault === undefined || minuteWithDefault === undefined) {
        const minHourMinuteInHour = { hour: updatedHour, minute: 0 } as const;
        return services[0].toHourMinute12(services[0].min(minHourMinuteInHour, range.start));
      }

      const orgHourMinute: HourMinute12 = { amPm: amPmWithDefault, hour: updatedHour, minute: minuteWithDefault };

      if (services[0].isAfter(orgHourMinute, range.end)) return services[0].toHourMinute12(range.end);

      if (services[0].isBefore(orgHourMinute, range.start)) return services[0].toHourMinute12(range.start);

      return { amPm, hour: updatedHour, minute };
    },
    getSubmitHourMinute: ({ amPm, hour, minute }, { defaultHourMinute }) => {
      const amPmWithDefault = getAmPmWithDefault(amPm, defaultHourMinute);

      if (!amPmWithDefault) return null;

      const submitHour =
        hour !== undefined
          ? services[0].toHour24(hour, amPmWithDefault)
          : defaultHourMinute
            ? services[0].toHour24((defaultHourMinute.hour % 12) as Hour12, amPmWithDefault)
            : undefined;
      const submitMinute = minute ?? defaultHourMinute?.minute;

      if (submitHour === undefined || submitMinute === undefined) return null;

      return { hour: submitHour, minute: submitMinute };
    },
    getAmPmWithDefault,
    getHour12WithDefault,
    getMinuteWithDefault,
  };
};
