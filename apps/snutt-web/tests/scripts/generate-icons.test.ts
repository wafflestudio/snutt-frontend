import { describe, expect, it } from 'vitest';
import { buildIconsTsx, extractPath, toDesignSvg } from '../../scripts/generate-icons.mjs';

describe('extractPath', () => {
  it('path 의 d 값을 꺼낸다', () => {
    expect(extractPath('<svg viewBox="0 -960 960 960"><path d="M0 0h10v10Z"/></svg>')).toBe('M0 0h10v10Z');
  });

  it('path 가 하나가 아니면 에러', () => {
    expect(() => extractPath('<svg><path d="a"/><path d="b"/></svg>')).toThrow('2개');
  });
});

describe('toDesignSvg', () => {
  it('viewBox 를 꺼내고 속성 이름을 camelCase 로 바꾼다', () => {
    const svg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 1Z" fill-rule="evenodd" stroke-width="2" fill="currentColor"/>
</svg>`;
    expect(toDesignSvg(svg, 'icon-a')).toEqual({
      viewBox: '0 0 16 16',
      body: '<path d="M1 1Z" fillRule="evenodd" strokeWidth="2" fill="currentColor"/>',
    });
  });

  it('상자 전체를 덮는 mask · clipPath 는 지우고 감싼 <g> 를 푼다', () => {
    const masked = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
<mask id="mask0_1" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
<rect width="24" height="24" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_1)">
<path d="M1 1Z" fill="currentColor"/>
</g>
</svg>`;
    expect(toDesignSvg(masked, 'icon-a').body).toBe('<path d="M1 1Z" fill="currentColor"/>');

    const clipped = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
<g clip-path="url(#clip0_1)">
<rect x="1" width="14" height="1" fill="currentColor"/>
</g>
<defs>
<clipPath id="clip0_1">
<rect width="16" height="16" fill="white"/>
</clipPath>
</defs>
</svg>`;
    expect(toDesignSvg(clipped, 'icon-a').body).toBe('<rect x="1" width="14" height="1" fill="currentColor"/>');
  });

  it('하는 일이 있는 mask 는 남기고 id 를 아이콘마다 다르게 바꾼다', () => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
<mask id="stroke0_1" fill="white"><path d="M2 2Z"/></mask>
<path d="M2 2Z" stroke="currentColor" mask="url(#stroke0_1)"/>
</svg>`;
    expect(toDesignSvg(svg, 'icon-kakaotalk').body).toBe(
      '<mask id="icon-kakaotalk-0" fill="white"><path d="M2 2Z"/></mask><path d="M2 2Z" stroke="currentColor" mask="url(#icon-kakaotalk-0)"/>',
    );
  });

  it('루트가 fill="none" 이 아니면 에러', () => {
    expect(() => toDesignSvg('<svg viewBox="0 0 16 16"><path d="M1 1Z"/></svg>', 'icon-a')).toThrow('fill="none"');
  });
});

describe('buildIconsTsx', () => {
  it('아이콘마다 컴포넌트를 export 한다', () => {
    const tsx = buildIconsTsx(
      [['IconRemove', 'M1 1Z']],
      [['IconAdd', { viewBox: '0 0 16 16', body: '<path d="M2 2Z"/>' }]],
    );
    expect(tsx).toContain(
      'export const IconRemove = (props: IconProps) => (\n  <Svg viewBox="0 -960 960 960" fill="currentColor" {...props}>\n    <path d="M1 1Z" />',
    );
    expect(tsx).toContain(
      'export const IconAdd = (props: IconProps) => (\n  <Svg viewBox="0 0 16 16" fill="none" {...props}>\n    <path d="M2 2Z"/>',
    );
  });
});
