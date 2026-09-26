/**
 * Material Symbols(@material-symbols/svg-400, outlined)에서 쓰는 아이콘만 골라 React 컴포넌트로 만든다.
 *
 * 실행: yarn generate:icons → src/shared/ui/icons.tsx
 *
 * 아이콘을 추가하려면 ICONS 에 `컴포넌트 이름: 'Material Symbols 파일 이름'` 을 넣고 다시 생성한다.
 * 파일 이름은 https://fonts.google.com/icons 의 아이콘 이름이고, 채운 모양은 `-fill` 을 붙인다.
 *
 * Figma 파일에서 아이콘을 내보낼 수 없어 레이어 이름과 모양으로 골랐다. (docs/snutt-web-design-questions.md C)
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ICONS: Record<string, string> = {
  IconAdd: 'add',
  IconArrowOutward: 'arrow_outward',
  IconBookmark: 'bookmark',
  IconBookmarkFill: 'bookmark-fill',
  IconCheckCircleFill: 'check_circle-fill',
  IconChevronDown: 'keyboard_arrow_down',
  IconChevronLeft: 'chevron_left',
  IconChevronRight: 'chevron_right',
  IconClose: 'close',
  IconCompare: 'mobiledata_arrows',
  IconCopy: 'content_copy',
  IconDarkMode: 'dark_mode',
  IconDownload: 'download',
  IconEdit: 'edit',
  IconFilter: 'tune',
  IconGroupFill: 'group-fill',
  IconLightMode: 'wb_sunny',
  IconLocationFill: 'location_on-fill',
  IconMoreHorizontal: 'more_horiz',
  IconMoreVertical: 'more_vert',
  IconRemove: 'remove',
  IconReviewFill: 'rate_review-fill',
  IconScheduleFill: 'schedule-fill',
  IconSearch: 'search',
  IconStarFill: 'star-fill',
  IconTagFill: 'sell-fill',
  IconThumbUp: 'thumb_up',
};

/** SVG 파일에서 path 의 d 값을 꺼낸다. Material Symbols 는 아이콘마다 path 가 하나다. */
export const extractPath = (svg: string) => {
  const paths = [...svg.matchAll(/<path d="([^"]+)"/g)].map(([, d]) => d);
  if (paths.length !== 1) throw new Error(`path 가 ${paths.length}개입니다.`);
  return paths[0];
};

export const buildIconsTsx = (icons: [name: string, d: string][]) =>
  [
    '// 자동 생성 파일. 직접 수정하지 않는다. (yarn generate:icons)',
    '// 출처: @material-symbols/svg-400 (outlined), Apache License 2.0',
    '',
    "import type { SVGProps } from 'react';",
    '',
    'export type IconProps = SVGProps<SVGSVGElement>;',
    '',
    '/** 크기는 글자 크기(1em)를 따르고 색은 currentColor 다. 의미가 있는 아이콘이면 aria-label 을 준다. */',
    'const Svg = ({ d, ...props }: IconProps & { d: string }) => (',
    '  <svg',
    '    viewBox="0 -960 960 960"',
    '    width="1em"',
    '    height="1em"',
    '    fill="currentColor"',
    "    aria-hidden={props['aria-label'] ? undefined : true}",
    '    {...props}',
    '  >',
    '    <path d={d} />',
    '  </svg>',
    ');',
    '',
    ...icons.map(([name, d]) => `export const ${name} = (props: IconProps) => <Svg d="${d}" {...props} />;\n`),
  ].join('\n');

const main = () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const require = createRequire(import.meta.url);
  const iconDir = path.join(path.dirname(require.resolve('@material-symbols/svg-400/package.json')), 'outlined');

  const icons = Object.entries(ICONS).map(([name, file]): [string, string] => {
    try {
      return [name, extractPath(fs.readFileSync(path.join(iconDir, `${file}.svg`), 'utf-8'))];
    } catch (error) {
      throw new Error(`${name} (${file}.svg): ${(error as Error).message}`);
    }
  });

  fs.writeFileSync(path.join(root, 'src/shared/ui/icons.tsx'), buildIconsTsx(icons));
  console.log(`src/shared/ui/icons.tsx 생성 (${icons.length}개)`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
