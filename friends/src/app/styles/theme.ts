import { Color, COLORS } from './colors';

export type ThemeValues = {
  color: {
    bg: { default: Color };
    text: { default: Color; selectLabel: Color; description: Color; guide: Color; primary: Color };
    button: { gray: { text: Color }; text: { disabled: Color } };
    border: { timetableMajor: Color; timetableMinor: Color; appBar: Color; divider: Color };
    input: { default: { border: Color }; focused: { border: Color } };
    tab: { active: { border: Color }; inactive: { border: Color } };
  };
};
export const getThemeValues = (theme: 'dark' | 'light'): ThemeValues => {
  return { color: theme === 'dark' ? getDarkThemeColors() : getLightThemeColors() };
};

const getLightThemeColors = (): ThemeValues['color'] => {
  return {
    bg: { default: COLORS.white },
    text: {
      default: COLORS.black,
      selectLabel: COLORS.gray60,
      description: COLORS.gray40,
      guide: COLORS.primary10,
      primary: COLORS.primary20,
    },
    button: { gray: { text: COLORS.gray40 }, text: { disabled: COLORS.gray20 } },
    border: {
      timetableMajor: COLORS.gray10,
      timetableMinor: COLORS.gray05,
      appBar: COLORS.gray30,
      divider: COLORS.gray05,
    },
    input: { default: { border: COLORS.gray15 }, focused: { border: COLORS.primary10 } },
    tab: { active: { border: COLORS.gray30 }, inactive: { border: COLORS.gray05 } },
  };
};

const getDarkThemeColors = (): ThemeValues['color'] => {
  return {
    bg: { default: COLORS.gray80 },
    text: {
      default: COLORS.white,
      selectLabel: COLORS.gray30,
      description: COLORS.gray30,
      guide: COLORS.primary20,
      primary: COLORS.primary10,
    },
    button: { gray: { text: COLORS.gray30 }, text: { disabled: COLORS.gray40 } },
    border: {
      timetableMajor: COLORS.gray70,
      timetableMinor: COLORS.gray70,
      appBar: COLORS.gray60,
      divider: COLORS.gray60,
    },
    input: { default: { border: COLORS.gray60 }, focused: { border: COLORS.primary20 } },
    tab: { active: { border: COLORS.white }, inactive: { border: COLORS.gray60 } },
  };
};
