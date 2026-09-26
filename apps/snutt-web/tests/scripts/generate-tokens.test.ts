import { describe, expect, it } from 'vitest';
import { buildTokensCss, toCssColor, toKebabCase, toTokenEntries } from '../../scripts/generate-tokens.mjs';

const color = (hex: string, alpha = 1) => ({ $type: 'color', $value: { hex, alpha } });

describe('toKebabCase', () => {
  it.each([
    ['Normal', 'normal'],
    ['darkMint1', 'dark-mint1'],
    ['onBG', 'on-bg'],
    ['lightField', 'light-field'],
    ['dividerStrong', 'divider-strong'],
  ])('%s → %s', (input, expected) => {
    expect(toKebabCase(input)).toBe(expected);
  });
});

describe('toCssColor', () => {
  it('불투명하면 소문자 hex', () => {
    expect(toCssColor({ hex: '#E54459', alpha: 1 })).toBe('#e54459');
  });

  it('투명도가 있으면 rgb + 퍼센트', () => {
    expect(toCssColor({ hex: '#000000', alpha: 0.20000000298023224 })).toBe('rgb(0 0 0 / 20%)');
    expect(toCssColor({ hex: '#3C3C3C', alpha: 0.6000000238418579 })).toBe('rgb(60 60 60 / 60%)');
  });
});

describe('toTokenEntries', () => {
  it('그룹마다 정해진 CSS 변수 이름공간을 쓴다', () => {
    const entries = toTokenEntries({
      Text: { Normal: color('#000000') },
      Background: { lightField: color('#F2F2F2') },
      Line: { divider: color('#C4C4C4') },
      Icon: { onItem: color('#FFFFFF') },
      SNUTT: { darkMint1: color('#00B8B0') },
      special: { warning: color('#ED6C58') },
      $extensions: { 'com.figma.modeName': 'Light' },
    });
    expect(entries.map((e) => [e.name, e.cssVariable])).toEqual([
      ['Text/Normal', '--text-color-normal'],
      ['Background/lightField', '--background-color-light-field'],
      ['Line/divider', '--color-line-divider'],
      ['Icon/onItem', '--color-icon-on-item'],
      ['SNUTT/darkMint1', '--color-snutt-dark-mint1'],
      ['special/warning', '--color-warning'],
    ]);
  });

  it('용도를 모르는 Color 그룹은 건너뛴다', () => {
    expect(toTokenEntries({ Color: color('#FFFFFF') })).toEqual([]);
  });

  it('매핑이 없는 새 그룹이 생기면 에러', () => {
    expect(() => toTokenEntries({ Shadow: { small: color('#000000') } })).toThrow('Shadow');
  });
});

describe('buildTokensCss', () => {
  it('라이트는 @theme, 다크는 [data-theme=dark] 에 같은 변수로 출력한다', () => {
    const css = buildTokensCss({ Text: { Normal: color('#000000') } }, { Text: { Normal: color('#FFFFFF') } });
    expect(css).toContain(
      '@theme static {\n  /* Tailwind 기본 색은 쓰지 않는다. 색은 아래 토큰만 쓴다. */\n  --color-*: initial;\n  --text-color-normal: #000000;\n}',
    );
    expect(css).toContain("[data-theme='dark'] {\n  --text-color-normal: #ffffff;\n}");
  });

  it('다크에 없는 토큰이 있으면 에러', () => {
    expect(() =>
      buildTokensCss(
        { Text: { Normal: color('#000000'), Plain: color('#505050') } },
        { Text: { Normal: color('#FFFFFF') } },
      ),
    ).toThrow('Text/Plain');
  });
});
