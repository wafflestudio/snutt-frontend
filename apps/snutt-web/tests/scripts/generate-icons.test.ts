import { describe, expect, it } from 'vitest';
import { buildIconsTsx, extractPath } from '../../scripts/generate-icons.mjs';

describe('extractPath', () => {
  it('path 의 d 값을 꺼낸다', () => {
    expect(extractPath('<svg viewBox="0 -960 960 960"><path d="M0 0h10v10Z"/></svg>')).toBe('M0 0h10v10Z');
  });

  it('path 가 하나가 아니면 에러', () => {
    expect(() => extractPath('<svg><path d="a"/><path d="b"/></svg>')).toThrow('2개');
  });
});

describe('buildIconsTsx', () => {
  it('아이콘마다 컴포넌트를 export 한다', () => {
    const tsx = buildIconsTsx([['IconAdd', 'M1 1Z']]);
    expect(tsx).toContain('export const IconAdd = (props: IconProps) => <Svg d="M1 1Z" {...props} />;');
  });
});
