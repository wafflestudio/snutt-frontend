export type Color = `#${string}`;
export const COLORS = {
  white: '#ffffff',
  black: '#000000',

  gray05: '#f2f2f2',
  gray10: '#ebebeb',
  gray15: '#dadada',
  gray20: '#c4c4c4',
  gray30: '#b3b3b3',
  gray35: '#a6a6a6',
  gray40: '#777',
  gray60: '#505050',
  gray70: '#3c3c3c',
  gray80: '#2b2b2b',

  primary10: '#00b8b0',
  primary20: '#1ca6a0',
} satisfies Record<string, Color>;
