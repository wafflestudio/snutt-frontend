/**
 * Figma Variables 에서 내보낸 디자인 토큰(design-tokens/*.tokens.json)을 Tailwind 테마로 바꾼다.
 *
 * 실행: yarn generate:tokens
 * - src/app/tokens.css            Tailwind 테마 (라이트 = @theme, 다크 = [data-theme='dark'] 에서 덮어씀)
 * - src/shared/lib/design-tokens.ts 토큰 목록 (토큰 확인 페이지 등에서 사용)
 *
 * Figma 그룹마다 Tailwind 테마 변수 이름공간을 다르게 둔다. 용도가 하나인 그룹은 그 속성 전용 이름공간을 써서
 * `text-text-normal` 처럼 이름이 겹치지 않게 한다.
 *
 * | Figma        | CSS 변수             | 클래스 예                            |
 * | ------------ | -------------------- | ------------------------------------ |
 * | Text/*       | --text-color-*       | text-normal, placeholder:text-med    |
 * | Background/* | --background-color-* | bg-normal, bg-light-field            |
 * | Line/*       | --color-line-*       | border-line-divider, bg-line-light   |
 * | Icon/*       | --color-icon-*       | text-icon-normal, fill-icon-on-item  |
 * | SNUTT/*      | --color-snutt-*      | bg-snutt-mint, text-snutt-dark-mint1 |
 * | special/*    | --color-*            | text-warning                         |
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Token = {
  $type: 'color';
  $value: { hex: string; alpha: number };
};
type TokenGroup = { [key: string]: unknown };

export type TokenEntry = { name: string; cssVariable: string; value: string };

/** Figma 그룹 이름 → CSS 변수 접두사. null 이면 건너뛴다. */
const GROUP_PREFIXES: Record<string, string | null> = {
  Text: '--text-color-',
  Background: '--background-color-',
  Line: '--color-line-',
  Icon: '--color-icon-',
  SNUTT: '--color-snutt-',
  special: '--color-',
  // 용도를 알 수 없는 최상위 변수 (라이트 / 다크 모두 #FFFFFF). docs/snutt-web-design-questions.md 참고
  Color: null,
};

const isToken = (value: unknown): value is Token =>
  typeof value === 'object' && value !== null && (value as Token).$type === 'color';

/** darkMint1 → dark-mint1, onBG → on-bg, Normal → normal */
export const toKebabCase = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

/** 불투명하면 #rrggbb, 투명도가 있으면 rgb(r g b / a%) */
export const toCssColor = ({ hex, alpha }: Token['$value']) => {
  const lower = hex.toLowerCase();
  if (alpha >= 1) return lower;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(lower.slice(i, i + 2), 16));
  return `rgb(${r} ${g} ${b} / ${Math.round(alpha * 100)}%)`;
};

/** 토큰 파일 → 토큰 목록. 모르는 그룹이 있으면 매핑을 정하라고 에러를 낸다. */
export const toTokenEntries = (tokens: TokenGroup): TokenEntry[] =>
  Object.entries(tokens)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([group, value]) => {
      if (!(group in GROUP_PREFIXES))
        throw new Error(
          `알 수 없는 토큰 그룹 "${group}". scripts/generate-tokens.mts 의 GROUP_PREFIXES 에 추가하세요.`,
        );
      const prefix = GROUP_PREFIXES[group];
      if (prefix === null) return [];
      return Object.entries(value as TokenGroup).map(([name, token]) => {
        if (!isToken(token)) throw new Error(`${group}/${name} 는 색상 토큰이 아닙니다.`);
        return {
          name: `${group}/${name}`,
          cssVariable: `${prefix}${toKebabCase(name)}`,
          value: toCssColor(token.$value),
        };
      });
    });

const toPairs = (light: TokenGroup, dark: TokenGroup) => {
  const lightEntries = toTokenEntries(light);
  const darkValues = new Map(toTokenEntries(dark).map((t) => [t.cssVariable, t.value]));
  return lightEntries.map(({ name, cssVariable, value }) => {
    const darkValue = darkValues.get(cssVariable);
    if (darkValue === undefined) throw new Error(`다크 토큰에 ${name} 가 없습니다.`);
    return { name, cssVariable, light: value, dark: darkValue };
  });
};

const HEADER = [
  '자동 생성 파일. 직접 수정하지 않는다. (yarn generate:tokens)',
  '출처: design-tokens/light.tokens.json, dark.tokens.json (Figma Variables > Semantic)',
];

export const buildTokensCss = (light: TokenGroup, dark: TokenGroup) => {
  const pairs = toPairs(light, dark);
  return [
    ...HEADER.map((line) => `/* ${line} */`),
    '',
    // static: 쓰지 않는 변수도 항상 출력한다. (인라인 스타일에서 var() 로 참조할 수 있게)
    '@theme static {',
    '  /* Tailwind 기본 색은 쓰지 않는다. 색은 아래 토큰만 쓴다. */',
    '  --color-*: initial;',
    ...pairs.map((t) => `  ${t.cssVariable}: ${t.light};`),
    '}',
    '',
    "[data-theme='dark'] {",
    ...pairs.map((t) => `  ${t.cssVariable}: ${t.dark};`),
    '}',
    '',
  ].join('\n');
};

export const buildTokenListTs = (light: TokenGroup, dark: TokenGroup) =>
  [
    ...HEADER.map((line) => `// ${line}`),
    '',
    '/** 디자인 토큰 목록. 값은 라이트 / 다크 테마의 CSS 색 */',
    `export const DESIGN_TOKENS = ${JSON.stringify(toPairs(light, dark), null, 2)} as const;`,
    '',
  ].join('\n');

const main = () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const read = (name: string) =>
    JSON.parse(fs.readFileSync(path.join(root, 'design-tokens', name), 'utf-8')) as TokenGroup;
  const light = read('light.tokens.json');
  const dark = read('dark.tokens.json');

  fs.writeFileSync(path.join(root, 'src/app/tokens.css'), buildTokensCss(light, dark));
  fs.writeFileSync(path.join(root, 'src/shared/lib/design-tokens.ts'), buildTokenListTs(light, dark));
  console.log('src/app/tokens.css, src/shared/lib/design-tokens.ts 생성');
};

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
