import { describe, expect, it } from 'vitest';
import { coversAnyCodePoint, toPngFileName } from '@/shared/lib/export-image';

const codePoints = (text: string) => [...text].map((char) => char.codePointAt(0) ?? 0);

describe('coversAnyCodePoint', () => {
  it('범위 · 한 글자 · 와일드카드(?) 중 하나라도 글자를 덮으면 true', () => {
    expect(coversAnyCodePoint('U+AC00-AC5F', codePoints('가'))).toBe(true);
    expect(coversAnyCodePoint('U+0041, U+AC60-ACFF', codePoints('A'))).toBe(true);
    expect(coversAnyCodePoint('U+4??', codePoints('ӿ'))).toBe(true);
  });

  it('범위의 양 끝도 덮는다', () => {
    expect(coversAnyCodePoint('U+AC00-AC5F', [0xac00])).toBe(true);
    expect(coversAnyCodePoint('U+AC00-AC5F', [0xac5f])).toBe(true);
    expect(coversAnyCodePoint('U+AC00-AC5F', [0xac60])).toBe(false);
  });

  it('덮는 글자가 없으면 false', () => {
    expect(coversAnyCodePoint('U+AC00-AC5F', codePoints('월화수'))).toBe(false);
    expect(coversAnyCodePoint('U+AC00-AC5F', [])).toBe(false);
  });

  it('unicode-range 가 없으면 모든 글자를 덮는다', () => {
    expect(coversAnyCodePoint('', codePoints('월'))).toBe(true);
  });
});

describe('toPngFileName', () => {
  it('이름에 .png 를 붙인다', () => {
    expect(toPngFileName('시간표 1', '시간표')).toBe('시간표 1.png');
  });

  it('파일 이름에 쓸 수 없는 글자는 _ 로 바꾼다', () => {
    expect(toPngFileName('1/2 학기: 계획?', '시간표')).toBe('1_2 학기_ 계획_.png');
  });

  it('비어 있으면 fallback 을 쓴다', () => {
    expect(toPngFileName('  ', '시간표')).toBe('시간표.png');
  });
});
