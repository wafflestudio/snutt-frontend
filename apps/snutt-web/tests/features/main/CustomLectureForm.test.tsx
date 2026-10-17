// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Timetable } from '@/domain/timetable';
import { toMinute } from '@/domain/time';
import { CustomLectureForm } from '@/features/main/components/CustomLectureForm';
import { SAMPLE_PALETTE, SAMPLE_TIMETABLES } from '@/features/main/sample-data';

// 시간표 1: 경영전략 월 9:00 ~ 11:45 가 기본 시간(월 9:00 ~ 10:00)과 겹친다
const [WITH_LECTURES, , EMPTY] = SAMPLE_TIMETABLES;

const setup = (timetable: Timetable | null = EMPTY) => {
  const handlers = { onSubmit: vi.fn(), onBack: vi.fn(), onClose: vi.fn() };
  render(<CustomLectureForm timetable={timetable} palette={SAMPLE_PALETTE} {...handlers} />);
  return handlers;
};

const timeRow = (n: number) => within(screen.getByRole('group', { name: `시간 ${n}` }));

const choose = async (combobox: HTMLElement, option: string) => {
  await userEvent.click(combobox);
  await userEvent.click(await screen.findByRole('option', { name: option }));
};

const submit = () => userEvent.click(screen.getByRole('button', { name: '추가' }));

describe('CustomLectureForm', () => {
  it('처음에는 월 오전 9:00 ~ 오전 10:00 한 줄이 있다', () => {
    setup();
    expect(timeRow(1).getByRole('combobox', { name: '요일' })).toHaveTextContent('월');
    expect(timeRow(1).getByRole('combobox', { name: '시작 시간' })).toHaveTextContent('오전 9:00');
    expect(timeRow(1).getByRole('combobox', { name: '끝 시간' })).toHaveTextContent('오전 10:00');
  });

  it('입력한 값을 다듬어 넘기고, 빈 칸은 null 로 넘긴다', async () => {
    const { onSubmit } = setup();
    await userEvent.type(screen.getByLabelText('강의명'), '  스터디 ');
    await userEvent.type(screen.getByLabelText('학점'), '2');
    await userEvent.type(screen.getByLabelText('비고'), '   ');
    await submit();

    expect(onSubmit).toHaveBeenCalledWith({
      title: '스터디',
      instructor: null,
      credit: 2,
      remark: null,
      classTimes: [{ day: 0, startMinute: toMinute(9), endMinute: toMinute(10), place: null }],
      color: { type: 'palette', index: 0 },
    });
  });

  it('고른 요일 · 장소 · 색상을 넘긴다', async () => {
    const { onSubmit } = setup();
    await userEvent.type(screen.getByLabelText('강의명'), '스터디');
    await userEvent.type(screen.getByLabelText('교수'), '김교수');
    await choose(screen.getByRole('combobox', { name: '색상' }), '색상3');
    await choose(timeRow(1).getByRole('combobox', { name: '요일' }), '금');
    await userEvent.type(timeRow(1).getByLabelText('장소'), ' 301-118 ');
    await submit();

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        instructor: '김교수',
        color: { type: 'palette', index: 2 },
        classTimes: [{ day: 4, startMinute: toMinute(9), endMinute: toMinute(10), place: '301-118' }],
      }),
    );
  });

  it('강의명이 비어 있으면 넘기지 않고 칸에 오류를 붙인다', async () => {
    const { onSubmit } = setup();
    await submit();

    const title = screen.getByLabelText('강의명');
    expect(title).toHaveAttribute('aria-invalid', 'true');
    expect(title).toHaveAccessibleDescription('강의명을 입력하세요');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('학점이 숫자가 아니면 넘기지 않는다', async () => {
    const { onSubmit } = setup();
    await userEvent.type(screen.getByLabelText('강의명'), '스터디');
    await userEvent.type(screen.getByLabelText('학점'), '2.5');
    await submit();

    expect(screen.getByLabelText('학점')).toHaveAccessibleDescription('학점은 숫자로 입력하세요');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('시간표의 강의와 시간이 겹치면 그 강의 이름을 알리고 넘기지 않는다', async () => {
    const { onSubmit } = setup(WITH_LECTURES);
    await userEvent.type(screen.getByLabelText('강의명'), '스터디');
    await submit();

    expect(screen.getByRole('alert')).toHaveTextContent('‘경영전략’ 강의와 시간이 겹칩니다');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('입력한 시간끼리 겹치면 넘기지 않는다', async () => {
    const { onSubmit } = setup();
    await userEvent.type(screen.getByLabelText('강의명'), '스터디');
    await userEvent.click(screen.getByRole('button', { name: '시간 추가' }));
    await submit();

    expect(screen.getByRole('alert')).toHaveTextContent('입력한 시간끼리 겹칩니다');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('시간 줄을 더하고 뺄 수 있고, 남은 줄의 번호가 다시 매겨진다', async () => {
    setup();
    // Figma: 줄이 하나여도 지울 수 있다
    expect(screen.getByRole('button', { name: '시간 1 삭제' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '시간 추가' }));
    await userEvent.click(screen.getByRole('button', { name: '시간 추가' }));
    await choose(timeRow(3).getByRole('combobox', { name: '요일' }), '수');
    expect(screen.getAllByRole('group')).toHaveLength(3);

    await userEvent.click(screen.getByRole('button', { name: '시간 2 삭제' }));
    expect(screen.getAllByRole('group')).toHaveLength(2);
    expect(timeRow(2).getByRole('combobox', { name: '요일' })).toHaveTextContent('수');
  });

  it('시작 시간을 끝 시간 뒤로 옮기면 끝 시간이 한 시간 뒤로 따라간다', async () => {
    setup();
    await choose(timeRow(1).getByRole('combobox', { name: '시작 시간' }), '오후 1:30');
    expect(timeRow(1).getByRole('combobox', { name: '끝 시간' })).toHaveTextContent('오후 2:30');
  });

  it('끝 시간은 시작 시간 뒤만 고를 수 있다', async () => {
    setup();
    await userEvent.click(timeRow(1).getByRole('combobox', { name: '끝 시간' }));
    const options = await screen.findAllByRole('option');
    expect(options[0]).toHaveTextContent('오전 9:05');
    expect(options.at(-1)).toHaveTextContent('오전 12:00');
  });

  it('시간표가 없으면 추가할 수 없다고 알린다', () => {
    setup(null);
    expect(screen.getByRole('button', { name: '추가' })).toBeDisabled();
    expect(screen.getByText('시간표를 먼저 만들어 주세요')).toBeInTheDocument();
  });

  it('`<` 와 취소는 목록으로, `×` 는 패널 접기로 이어진다', async () => {
    const { onBack, onClose } = setup();
    await userEvent.click(screen.getByRole('button', { name: '목록으로' }));
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    await userEvent.click(screen.getByRole('button', { name: '패널 접기' }));
    expect(onBack).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
