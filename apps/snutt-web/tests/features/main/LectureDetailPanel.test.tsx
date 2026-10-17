// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { TimetableLecture } from '@/domain/lecture';
import { LectureDetailPanel } from '@/features/main/components/LectureDetailPanel';
import type { LectureDetail } from '@/features/main/main-view';
import { SAMPLE_PALETTE, SAMPLE_TIMETABLES } from '@/features/main/sample-data';

const [WITH_INFO, WITH_CUSTOM] = SAMPLE_TIMETABLES;
// 서양근대윤리학의 이해: 화 · 목 15:00 ~ 16:50, 수강 정보가 다 있다
const LECTURE = WITH_INFO.lectures.find(({ id }) => id === '1-3')!;
// 동아리 모임: 직접 추가한 강의
const CUSTOM = WITH_CUSTOM.lectures.find(({ id }) => id === '2-4')!;

const setup = (lecture: TimetableLecture = LECTURE, detail: Partial<LectureDetail> = {}) => {
  const handlers = { onChange: vi.fn(), onClose: vi.fn(), onColorChange: vi.fn(), onSave: vi.fn(), onRemove: vi.fn() };
  render(
    <LectureDetailPanel
      detail={{ lectureId: lecture.id, view: 'info', editing: false, ...detail }}
      lecture={lecture}
      semester={WITH_INFO.semester}
      palette={SAMPLE_PALETTE}
      timetableLectures={lecture === CUSTOM ? WITH_CUSTOM.lectures : WITH_INFO.lectures}
      {...handlers}
    />,
  );
  return handlers;
};

/** 라벨 → 값. `(없음)` 도 그대로 읽는다 */
const rows = (container: HTMLElement) =>
  Object.fromEntries(
    within(container)
      .getAllByRole('term')
      .map((term) => [term.textContent, term.nextElementSibling?.textContent]),
  );

const section = (name: string) => screen.getByRole('region', { name });

describe('LectureDetailPanel', () => {
  it('강의명을 제목으로 쓰고, 수강 정보를 라벨과 함께 보여 준다. 없는 값은 (없음)', () => {
    setup();
    expect(screen.getByRole('heading', { level: 2, name: '서양근대윤리학의 이해' })).toBeInTheDocument();
    expect(rows(section('수강 정보'))).toEqual({
      학과: '인문대학 철학과',
      학년: '1학년',
      학점: '3',
      분류: '교양',
      구분: '인간과 사회',
      '(구)교양영역': '사상과 가치',
      강좌번호: '045.019',
      분반번호: '002',
      '정원(재학생)': '80(60)',
    });
    expect(within(section('비고')).getByText('(없음)')).toBeInTheDocument();
  });

  it('수업 시간은 요일 순으로 시간과 장소를 쓴다', () => {
    setup();
    const times = within(section('시간 및 장소')).getAllByRole('listitem');
    expect(times.map((time) => rows(time))).toEqual([
      { 시간: '화 15:00 ~ 16:50', 장소: '058-331' },
      { 시간: '목 15:00 ~ 16:50', 장소: '058-331' },
    ]);
  });

  it('강의계획서는 수강신청 사이트를 새 탭으로 연다', () => {
    setup();
    const link = screen.getByRole('link', { name: '강의계획서' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('href')).toContain('sbjtCd=045.019');
  });

  it('직접 추가한 강의는 수강 정보와 강의계획서 없이 학점을 위에 쓴다', () => {
    setup(CUSTOM);
    expect(screen.queryByRole('region', { name: '수강 정보' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '강의계획서' })).not.toBeInTheDocument();
    expect(screen.getByText('학점').nextElementSibling).toHaveTextContent('(없음)');
  });

  it('색상 견본을 눌러 팔레트 색을 고른다', async () => {
    const { onColorChange } = setup();
    const color = screen.getByRole('combobox', { name: '색상' });
    expect(color).toHaveTextContent('색상4'); // 견본만 보이고, 이름은 스크린 리더가 읽는다

    await userEvent.click(color);
    await userEvent.click(await screen.findByRole('option', { name: '색상7' }));
    expect(onColorChange).toHaveBeenCalledWith({ type: 'palette', index: 6 });
  });

  it('삭제는 확인을 받은 뒤에 한다', async () => {
    const { onRemove } = setup();
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    const dialog = await screen.findByRole('alertdialog', { name: '‘서양근대윤리학의 이해’ 강의를 삭제하시겠습니까?' });
    expect(onRemove).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('button', { name: '삭제' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('강의평으로 바꾸고, `<` 는 상세를 닫고, `×` 는 패널을 접는다', async () => {
    const { onChange, onClose } = setup();
    await userEvent.click(screen.getByRole('tab', { name: '강의평' }));
    expect(onChange).toHaveBeenLastCalledWith({ lectureId: '1-3', view: 'review', editing: false });

    await userEvent.click(screen.getByRole('button', { name: '목록으로' }));
    expect(onChange).toHaveBeenLastCalledWith(null);

    await userEvent.click(screen.getByRole('button', { name: '패널 접기' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('강의평 쪽은 8-4 전까지 비어 있다', () => {
    setup(LECTURE, { view: 'review' });
    expect(screen.getByRole('tab', { name: '강의평', selected: true })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: '수강 정보' })).not.toBeInTheDocument();
  });
});

describe('LectureDetailPanel 편집', () => {
  const editing = (lecture: TimetableLecture = LECTURE) => setup(lecture, { editing: true });
  const field = (name: string) => screen.getByRole('textbox', { name });
  const save = () => userEvent.click(screen.getByRole('button', { name: '저장' }));
  const choose = async (combobox: HTMLElement, option: string) => {
    await userEvent.click(combobox);
    await userEvent.click(await screen.findByRole('option', { name: option }));
  };

  it('강의편집을 누르면 편집 상태로 바꾼다', async () => {
    const { onChange } = setup();
    await userEvent.click(screen.getByRole('button', { name: '강의편집' }));
    expect(onChange).toHaveBeenLastCalledWith({ lectureId: '1-3', view: 'info', editing: true });
  });

  it('입력칸에 지금 값을 채우고, 수강 정보는 고칠 수 없게 그대로 보여 준다', () => {
    editing();
    expect(field('강의명')).toHaveValue('서양근대윤리학의 이해');
    expect(field('교수')).toHaveValue('이서연');
    expect(field('비고')).toHaveValue('');
    expect(screen.queryByRole('textbox', { name: '학점' })).not.toBeInTheDocument();
    expect(rows(section('수강 정보'))).toMatchObject({ 학과: '인문대학 철학과', 학점: '3' });

    const first = within(screen.getByRole('group', { name: '시간 1' }));
    expect(first.getByRole('combobox', { name: '요일' })).toHaveTextContent('화');
    expect(first.getByRole('combobox', { name: '시작 시간' })).toHaveTextContent('오후 3:00');
    expect(first.getByRole('textbox', { name: '장소' })).toHaveValue('058-331');
  });

  it('바뀐 필드만 넘기고, 지운 칸은 null 로 넘긴다', async () => {
    const { onSave } = editing();
    await userEvent.clear(field('강의명'));
    await userEvent.type(field('강의명'), ' 근대윤리학 ');
    await userEvent.clear(field('교수'));
    await userEvent.type(field('비고'), '시험 없음');
    await save();
    expect(onSave).toHaveBeenCalledWith(
      { title: '근대윤리학', instructor: null, remark: '시험 없음' },
      expect.any(Function),
    );
  });

  it('시간과 색상을 바꾸면 수업 시간 전체와 색을 넘긴다', async () => {
    const { onSave } = editing();
    await choose(within(screen.getByRole('group', { name: '시간 2' })).getByRole('combobox', { name: '요일' }), '월');
    await choose(screen.getByRole('combobox', { name: '색상' }), '색상7');
    await save();
    expect(onSave).toHaveBeenCalledWith(
      {
        classTimes: [
          { day: 1, startMinute: 900, endMinute: 1010, place: '058-331' },
          { day: 0, startMinute: 900, endMinute: 1010, place: '058-331' },
        ],
        color: { type: 'palette', index: 6 },
      },
      expect.any(Function),
    );
  });

  it('저장되면 편집 상태를 끝낸다', async () => {
    const { onSave, onChange } = editing();
    await userEvent.type(field('비고'), '메모');
    await save();
    const [, done] = onSave.mock.calls[0];
    done();
    expect(onChange).toHaveBeenLastCalledWith({ lectureId: '1-3', view: 'info', editing: false });
  });

  it('바뀐 것이 없으면 저장하지 않고 편집을 끝낸다. 취소도 편집을 끝낸다', async () => {
    const { onSave, onChange } = editing();
    await save();
    expect(onSave).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith({ lectureId: '1-3', view: 'info', editing: false });

    onChange.mockClear();
    await userEvent.type(field('비고'), '메모');
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenLastCalledWith({ lectureId: '1-3', view: 'info', editing: false });
  });

  it('강의명이 비어 있거나 다른 강의와 시간이 겹치면 저장하지 않는다', async () => {
    const { onSave } = editing();
    await userEvent.clear(field('강의명'));
    // 시간 1 을 화 → 수 15:00 으로 옮기면 재무관리(수 14:00 ~ 17:00)와 겹친다
    await choose(within(screen.getByRole('group', { name: '시간 1' })).getByRole('combobox', { name: '요일' }), '수');
    await save();
    expect(field('강의명')).toHaveAccessibleDescription('강의명을 입력하세요');
    expect(screen.getByRole('alert')).toHaveTextContent('‘재무관리’ 강의와 시간이 겹칩니다');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('직접 추가한 강의는 학점도 고친다', async () => {
    const { onSave } = editing(CUSTOM);
    expect(screen.queryByRole('region', { name: '수강 정보' })).not.toBeInTheDocument();
    await userEvent.type(field('학점'), '2');
    await save();
    expect(onSave).toHaveBeenCalledWith({ credit: 2 }, expect.any(Function));
  });
});
