import { useState } from 'react';
import styled from 'styled-components';

import type { Color } from '@/entities/color';

type Props = {
  timeTableTheme: number;
  colorList: Color[];
  currentColor?: Color;
  onChangeColor: (index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, color: Color) => void;
};

const defaultCustomColor = '#888888';

export const MainLectureEditFormColor = ({ timeTableTheme, colorList, currentColor, onChangeColor }: Props) => {
  const [customValue, setCustomValue] = useState<string>();

  const themeName = TIMETABLE_THEME_NAMES[timeTableTheme];

  const isCustomColor = !!currentColor && colorList.every((c) => c.bg !== currentColor.bg);

  return (
    <ColorChipsWrapper>
      {colorList.map((c, i) => {
        const isSelected = currentColor?.bg === c.bg;

        return (
          <ColorChip
            data-testid="main-lecture-edit-form-color"
            aria-selected={isSelected}
            key={c.bg}
            style={
              isSelected
                ? { border: `1px solid ${c.bg}`, backgroundColor: c.bg, color: c.fg }
                : { border: `1px solid ${c.bg}`, color: c.bg }
            }
            onClick={() => {
              if (!customValue && isCustomColor) setCustomValue(currentColor.bg);
              onChangeColor((i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, c);
            }}
          >
            {themeName ? `${themeName} ${i + 1}` : c.bg}
          </ColorChip>
        );
      })}

      <CustomColorChip
        data-testid="main-lecture-edit-form-custom-color"
        aria-selected={isCustomColor}
        style={
          isCustomColor
            ? {
                border: `1px solid ${currentColor?.bg}`,
                backgroundColor: `${currentColor?.bg}`,
                color: `${currentColor?.fg}`,
              }
            : { border: `1px solid rgb(183, 195, 206)`, color: 'rgb(183, 195, 206)' }
        }
      >
        나만의 색
        <Palette
          value={customValue ?? (isCustomColor ? currentColor.bg : defaultCustomColor)}
          onChange={(e) => {
            onChangeColor(0, { bg: e.target.value, fg: '#ffffff' });
            setCustomValue(e.target.value);
          }}
          onClick={(e) =>
            'value' in e.target &&
            typeof e.target.value === 'string' &&
            onChangeColor(0, { bg: e.target.value, fg: '#ffffff' })
          }
        />
      </CustomColorChip>
    </ColorChipsWrapper>
  );
};

const ColorChipsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const ColorChip = styled.label`
  padding: 4px 8px;
  font-family: Courier;
  font-size: 11px;
  font-weight: 500;
  margin: 0;
  border-radius: 12px;
  cursor: pointer;

  transition: all 0.1s;
`;

const CustomColorChip = styled.label`
  padding: 4px 8px;
  font-family: Courier;
  font-size: 11px;
  font-weight: 500;
  margin: 0;
  border-radius: 4px;
  cursor: pointer;

  transition: all 0.1s;
`;

const Palette = styled.input.attrs({ type: 'color' })`
  display: none;
`;

const TIMETABLE_THEME_NAMES = ['SNUTT', '가을', '모던', '벛꽃', '얼음', '잔디'];
// : { [color: string]: string | undefined } = {
//   '#e54459': '석류',
//   '#f58d3d': '감귤',
//   '#fac52d': '들국',
//   '#a6d930': '완두',
//   '#2bc366': '비취',
//   '#1bd0c9': '지중해',
//   '#1d99e9': '하늘',
//   '#4f48c4': '라벤더',
//   '#af56b3': '자수정',
// };
