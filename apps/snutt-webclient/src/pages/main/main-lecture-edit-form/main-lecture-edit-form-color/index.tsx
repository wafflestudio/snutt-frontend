import { useState } from 'react';
import styled from 'styled-components';

import { COLOR_LABEL_MAP } from '@/constants/color';
import type { Color } from '@/entities/color';

type Props = {
  colorList: Color[];
  currentColor?: Color;
  onChangeColor: (index: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, color: Color) => void;
};

const defaultCustomColor = '#888888';

export const MainLectureEditFormColor = ({ colorList, currentColor, onChangeColor }: Props) => {
  const [customValue, setCustomValue] = useState<string>();

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
            {COLOR_LABEL_MAP[c.bg] ?? c.bg}
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
