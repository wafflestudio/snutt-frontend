/**
 * 아이콘 SVG 를 React 컴포넌트로 만든다.
 *
 * 실행: yarn generate:icons → src/shared/ui/icons.tsx
 *
 * 출처는 두 가지다.
 * - DESIGN_ICONS: 디자이너에게 받은 SVG (design-icons/, Figma `Web 컴포넌트` 의 아이콘 컴포넌트). 색은 currentColor 로 받았다.
 *   Figma 에서 쓰는 크기(16 · 24 · 30px 상자)로 그리면 Figma 와 1:1 로 맞는다.
 * - MATERIAL_ICONS: 받지 못한 아이콘. Material Symbols(@material-symbols/svg-400, outlined)에서 모양이 가장 비슷한 것을 골랐다.
 *   파일 이름은 https://fonts.google.com/icons 의 아이콘 이름이고, 채운 모양은 `-fill` 을 붙인다.
 *   임시: 받으면 design-icons/ 에 넣고 DESIGN_ICONS 로 옮긴다. (docs/snutt-web-dev-plan.md 미결 사항 "아이콘 교체")
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 컴포넌트 이름: design-icons/ 안의 경로 (.svg 생략) */
export const DESIGN_ICONS: Record<string, string> = {
  IconAdd: 'add',
  IconBookmarkFill: 'bookmark',
  IconChevronLeft: 'arrow-left',
  IconChevronRight: 'arrow-right',
  IconClose: 'close',
  IconCompare: 'switch',
  IconDarkMode: 'theme-dark',
  IconDockToRight: 'sidebar',
  IconEdit: 'edit',
  IconKakaotalk: 'kakaotalk',
  IconLightMode: 'theme-light',
  IconLocationFill: 'map',
  IconMoreHorizontal: 'more',
  IconPerson: 'person',
  IconScheduleFill: 'clock',
  IconTabFriend: 'tab/friend',
  IconTabMore: 'tab/more',
  IconTabReview: 'tab/review',
  IconTabSearch: 'tab/search',
  IconTagFill: 'tag',
  IconTrash: 'trash',
};

/** 컴포넌트 이름: Material Symbols 파일 이름 */
export const MATERIAL_ICONS: Record<string, string> = {
  IconArrowOutward: 'arrow_outward',
  IconBookmark: 'bookmark',
  IconCheckCircleFill: 'check_circle-fill',
  IconChevronDown: 'keyboard_arrow_down',
  IconCopy: 'content_copy',
  IconDownload: 'download',
  IconFilter: 'tune',
  IconMoreVertical: 'more_vert',
  IconRefresh: 'refresh',
  IconRemove: 'remove',
  IconSearch: 'search',
  IconShare: 'share',
  IconStar: 'star',
  IconStarFill: 'star-fill',
  IconThumbUp: 'thumb_up',
};

/** SVG 파일에서 path 의 d 값을 꺼낸다. Material Symbols 는 아이콘마다 path 가 하나다. */
export const extractPath = (svg: string) => {
  const paths = [...svg.matchAll(/<path d="([^"]+)"/g)].map(([, d]) => d);
  if (paths.length !== 1) throw new Error(`path 가 ${paths.length}개입니다.`);
  return paths[0];
};

export type DesignSvg = { viewBox: string; body: string };

/**
 * Figma 에서 내보낸 SVG → viewBox 와 JSX 본문.
 * - 아이콘 상자 전체를 덮는 mask · clipPath(Figma 가 붙이는 것)는 아무 일도 하지 않으므로 지우고 감싼 <g> 를 푼다.
 * - 남는 id 는 아이콘마다 다르게 바꾼다. (한 화면에 여러 아이콘이 있어도 겹치지 않게)
 * - 속성 이름을 JSX 에 맞게 camelCase 로 바꾼다. (stroke-width → strokeWidth)
 */
export const toDesignSvg = (svg: string, idPrefix: string): DesignSvg => {
  const root = /<svg([^>]*)>([\s\S]*)<\/svg>/.exec(svg);
  if (!root) throw new Error('<svg> 가 없습니다.');
  const viewBox = /viewBox="([^"]+)"/.exec(root[1])?.[1];
  if (!viewBox) throw new Error('viewBox 가 없습니다.');
  if (!/fill="none"/.test(root[1])) throw new Error('<svg fill="none"> 이 아닙니다.');
  const [, , width, height] = viewBox.split(' ');
  let body = root[2];

  // 상자 전체를 덮는 사각형 하나뿐인 mask · clipPath
  const fullRect = new RegExp(`^\\s*<rect width="${width}" height="${height}" fill="[^"]+"/>\\s*$`);
  for (const [whole, tag, id, inner] of [...body.matchAll(/<(mask|clipPath) id="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)]) {
    if (!fullRect.test(inner)) continue;
    body = body.replace(whole, '');
    const attr = tag === 'mask' ? 'mask' : 'clip-path';
    const wrapper = new RegExp(`<g ${attr}="url\\(#${id}\\)">([\\s\\S]*?)</g>`);
    if (!wrapper.test(body)) throw new Error(`${tag} #${id} 를 쓰는 <g> 를 찾지 못했습니다.`);
    body = body.replace(wrapper, '$1');
  }
  body = body.replace(/<defs>\s*<\/defs>/g, '');

  const ids = [...body.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id);
  ids.forEach((id, i) => {
    body = body.replaceAll(`"${id}"`, `"${idPrefix}-${i}"`).replaceAll(`#${id})`, `#${idPrefix}-${i})`);
  });

  if (/ style="/.test(body)) throw new Error('style 속성은 바꿀 수 없습니다.');
  body = body
    .replace(
      / ([a-z]+(?:-[a-z]+)+)=/g,
      (_, name: string) => ` ${name.replace(/-([a-z])/g, (__, c: string) => c.toUpperCase())}=`,
    )
    .replace(/\s*\n\s*/g, '')
    .trim();

  return { viewBox, body };
};

/** IconTabSearch → icon-tab-search */
const toKebabCase = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export const buildIconsTsx = (material: [name: string, d: string][], design: [name: string, svg: DesignSvg][]) =>
  [
    '// 자동 생성 파일. 직접 수정하지 않는다. (yarn generate:icons)',
    '// 출처: design-icons/ (디자이너에게 받은 SVG), @material-symbols/svg-400 (outlined, Apache License 2.0)',
    '',
    "import type { SVGProps } from 'react';",
    '',
    'export type IconProps = SVGProps<SVGSVGElement>;',
    '',
    '/** 크기는 글자 크기(1em)를 따르고 색은 currentColor 다. 의미가 있는 아이콘이면 aria-label 을 준다. */',
    'const Svg = ({ viewBox, fill, children, ...props }: IconProps & { viewBox: string; fill: string }) => (',
    '  <svg',
    '    viewBox={viewBox}',
    '    width="1em"',
    '    height="1em"',
    '    fill={fill}',
    "    aria-hidden={props['aria-label'] ? undefined : true}",
    '    {...props}',
    '  >',
    '    {children}',
    '  </svg>',
    ');',
    '',
    '// 디자이너에게 받은 아이콘. Figma 의 아이콘 상자 크기(viewBox)로 그리면 Figma 와 같다.',
    '',
    ...design.map(
      ([name, { viewBox, body }]) =>
        `export const ${name} = (props: IconProps) => (\n  <Svg viewBox="${viewBox}" fill="none" {...props}>\n    ${body}\n  </Svg>\n);\n`,
    ),
    '// Material Symbols. 임시: 디자이너에게 받으면 바꾼다.',
    '',
    ...material.map(
      ([name, d]) =>
        `export const ${name} = (props: IconProps) => (\n  <Svg viewBox="0 -960 960 960" fill="currentColor" {...props}>\n    <path d="${d}" />\n  </Svg>\n);\n`,
    ),
  ].join('\n');

const main = () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const require = createRequire(import.meta.url);
  const materialDir = path.join(path.dirname(require.resolve('@material-symbols/svg-400/package.json')), 'outlined');

  /** 실패하면 어느 아이콘인지 알 수 있게 에러에 이름과 파일을 붙인다 */
  const convert = <T,>(name: string, file: string, fn: (svg: string) => T) => {
    try {
      return fn(fs.readFileSync(file, 'utf-8'));
    } catch (error) {
      throw new Error(`${name} (${file}): ${(error as Error).message}`);
    }
  };

  const design = Object.entries(DESIGN_ICONS).map(([name, file]): [string, DesignSvg] => [
    name,
    convert(name, path.join(root, 'design-icons', `${file}.svg`), (svg) => toDesignSvg(svg, toKebabCase(name))),
  ]);
  const material = Object.entries(MATERIAL_ICONS).map(([name, file]): [string, string] => [
    name,
    convert(name, path.join(materialDir, `${file}.svg`), extractPath),
  ]);

  fs.writeFileSync(path.join(root, 'src/shared/ui/icons.tsx'), buildIconsTsx(material, design));
  console.log(`src/shared/ui/icons.tsx 생성 (디자인 ${design.length}개, Material ${material.length}개)`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
