import { Color, COLORS } from './colors';

export type ThemeValues = {
  theme: 'light' | 'dark';
  color: {
    bg: { default: Color };
    text: {
      default: Color;
      selectLabel: Color;
      description: Color;
      guide: Color;
      primary: Color;
      subtitle: Color;
      caption: Color;
      hint: Color;
    };
    button: { gray: { text: Color }; text: { disabled: Color }; outlined: { primary: Color; gray: Color } };
    border: { timetableMajor: Color; timetableMinor: Color; appBar: Color; divider: Color };
    input: { placeholder: Color; default: { border: Color }; focused: { border: Color } };
    tab: { active: { border: Color; text: Color }; inactive: { border: Color; text: Color } };
  };
};
export const getThemeValues = (theme: 'dark' | 'light'): ThemeValues => {
  return { theme, color: theme === 'dark' ? getDarkThemeColors() : getLightThemeColors() };
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
      subtitle: COLORS.gray80,
      caption: COLORS.gray35,
      hint: COLORS.gray40,
    },
    button: {
      gray: { text: COLORS.gray40 },
      text: { disabled: COLORS.gray20 },
      outlined: { primary: COLORS.primary20, gray: COLORS.gray20 },
    },
    border: {
      timetableMajor: COLORS.gray10,
      timetableMinor: COLORS.gray05,
      appBar: COLORS.gray30,
      divider: COLORS.gray05,
    },
    input: { placeholder: COLORS.gray20, default: { border: COLORS.gray15 }, focused: { border: COLORS.primary10 } },
    tab: {
      active: { border: COLORS.gray30, text: COLORS.black },
      inactive: { border: COLORS.gray05, text: COLORS.gray30 },
    },
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
      subtitle: COLORS.white,
      caption: COLORS.gray40,
      hint: COLORS.gray35,
    },
    button: {
      gray: { text: COLORS.gray30 },
      text: { disabled: COLORS.gray40 },
      outlined: { primary: COLORS.primary10, gray: COLORS.gray40 },
    },
    border: {
      timetableMajor: COLORS.gray70,
      timetableMinor: COLORS.gray70,
      appBar: COLORS.gray60,
      divider: COLORS.gray60,
    },
    input: {
      placeholder: COLORS.gray40,
      default: { border: COLORS.gray60 },
      focused: { border: COLORS.primary20 },
    },
    tab: {
      active: { border: COLORS.white, text: COLORS.white },
      inactive: { border: COLORS.gray60, text: COLORS.gray40 },
    },
  };
};
