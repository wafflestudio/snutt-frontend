// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { ColorPair, LectureColor } from '@/domain/color';
import { ColorSelect } from '@/shared/ui/ColorSelect';
import { Select } from '@/shared/ui/Select';

const DAYS = ['월', '화', '수'].map((label, value) => ({ value, label }));

function DaySelect() {
  const [day, setDay] = useState(0);
  return (
    <>
      <label htmlFor="day">요일</label>
      <Select id="day" options={DAYS} value={day} onValueChange={setDay} />
      <output>{day}</output>
    </>
  );
}

const PALETTE: ColorPair[] = ['#e54459', '#f58d3d', '#fac42d'].map((bg) => ({ bg, fg: '#ffffff' }));

function ColorExample({ initial }: { initial: LectureColor }) {
  const [color, setColor] = useState(initial);
  return (
    <>
      <ColorSelect aria-label="색상" palette={PALETTE} value={color} onValueChange={setColor} />
      <output>{JSON.stringify(color)}</output>
    </>
  );
}

describe('Select', () => {
  it('label 로 이름이 붙고, 고른 값을 보여 준다', async () => {
    render(<DaySelect />);
    const trigger = screen.getByRole('combobox', { name: '요일' });
    expect(trigger).toHaveTextContent('월');

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: '수' }));
    expect(trigger).toHaveTextContent('수');
    expect(screen.getByRole('status')).toHaveTextContent('2');
  });
});

describe('ColorSelect', () => {
  it('팔레트 색을 색상1부터 보여 주고, 고르면 palette 색으로 바뀐다', async () => {
    render(<ColorExample initial={{ type: 'palette', index: 0 }} />);
    const trigger = screen.getByRole('combobox', { name: '색상' });
    expect(trigger).toHaveTextContent('색상1');

    await userEvent.click(trigger);
    expect((await screen.findAllByRole('option')).map((o) => o.textContent)).toEqual(['색상1', '색상2', '색상3']);
    await userEvent.click(screen.getByRole('option', { name: '색상3' }));
    expect(trigger).toHaveTextContent('색상3');
    expect(screen.getByRole('status')).toHaveTextContent('{"type":"palette","index":2}');
  });

  it('직접 고른 색은 목록에 없고 버튼에만 보인다', () => {
    render(<ColorExample initial={{ type: 'custom', color: { bg: '#ffd8d8', fg: '#c43a3a' } }} />);
    expect(screen.getByRole('combobox', { name: '색상' })).toHaveTextContent('직접 고른 색');
  });
});
