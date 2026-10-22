import { toBlob } from 'html-to-image';

/*
 * 화면의 요소를 PNG 로 만들어 내려받거나 공유한다 (시간표 내보내기).
 * html2canvas 는 Tailwind v4 의 oklch() 색을 읽지 못해 html-to-image 를 쓴다. 브라우저가 SVG 로 그대로 그리므로 토큰 색이 그대로 나온다.
 */

/** 이미지 배율. 화면보다 선명하게 2배로 만든다 */
const PIXEL_RATIO = 2;

/** `U+AC00-AC5F, U+0041, U+4??` 의 한 칸을 [시작, 끝] 으로 */
const parseUnicodeRange = (part: string): [number, number] | null => {
  const value = part.trim().replace(/^u\+/i, '');
  if (!value) return null;
  const [start, end] = value.includes('-') ? value.split('-') : [value.replace(/\?/g, '0'), value.replace(/\?/g, 'F')];
  const range: [number, number] = [parseInt(start, 16), parseInt(end, 16)];
  return range.some(Number.isNaN) ? null : range;
};

/** @font-face 의 unicode-range 가 글자 중 하나라도 덮는지. unicode-range 가 없으면 모든 글자를 덮는다 */
export const coversAnyCodePoint = (unicodeRange: string, codePoints: Iterable<number>): boolean => {
  if (!unicodeRange.trim()) return true;
  const ranges = unicodeRange
    .split(',')
    .map(parseUnicodeRange)
    .filter((range) => range !== null);
  for (const codePoint of codePoints) {
    if (ranges.some(([start, end]) => start <= codePoint && codePoint <= end)) return true;
  }
  return false;
};

const normalizeFontFamily = (family: string) => family.trim().replace(/["']/g, '');

const toDataUrl = async (url: string) => {
  const blob = await (await fetch(url)).blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

/**
 * node 의 글자를 그리는 데 필요한 @font-face 만 글꼴 파일을 data URL 로 넣어 모은 CSS.
 * Pretendard dynamic subset 은 글꼴 파일이 90여 개로 나뉘어 있어 html-to-image 에 맡기면 쓰지 않는 파일까지 모두 받는다.
 * 그래서 node 의 글자를 덮는 unicode-range 의 파일만 넣는다.
 */
export const getFontEmbedCss = async (node: HTMLElement): Promise<string> => {
  const families = new Set(getComputedStyle(node).fontFamily.split(',').map(normalizeFontFamily));
  const codePoints = new Set([...(node.textContent ?? '')].map((char) => char.codePointAt(0) ?? 0));

  const rules = [...node.ownerDocument.styleSheets].flatMap((sheet) => {
    try {
      return [...sheet.cssRules]
        .filter((rule) => rule instanceof CSSFontFaceRule)
        .map((rule) => ({ rule, baseUrl: sheet.href ?? node.ownerDocument.baseURI }));
    } catch {
      // 다른 출처의 스타일시트는 규칙을 읽을 수 없다
      return [];
    }
  });
  const used = rules.filter(
    ({ rule }) =>
      families.has(normalizeFontFamily(rule.style.getPropertyValue('font-family'))) &&
      coversAnyCodePoint(rule.style.getPropertyValue('unicode-range'), codePoints),
  );

  const cssTexts = await Promise.all(
    used.map(async ({ rule, baseUrl }) => {
      let cssText = rule.cssText;
      for (const [match, , url] of rule.cssText.matchAll(/url\((["']?)([^"')]+)\1\)/g)) {
        if (url.startsWith('data:')) continue;
        cssText = cssText.replace(match, `url("${await toDataUrl(new URL(url, baseUrl).href)}")`);
      }
      return cssText;
    }),
  );
  return cssTexts.join('\n');
};

/** node 를 화면에 보이는 모양 그대로 PNG 로 만든다 */
export const toPngBlob = async (node: HTMLElement): Promise<Blob> => {
  const blob = await toBlob(node, { pixelRatio: PIXEL_RATIO, fontEmbedCSS: await getFontEmbedCss(node) });
  if (!blob) throw new Error('이미지를 만들지 못했습니다.');
  return blob;
};

/** 파일 이름에 쓸 수 없는 글자(`/` 등)를 `_` 로 바꾸고 `.png` 를 붙인다. 비어 있으면 `fallback` */
export const toPngFileName = (name: string, fallback: string) =>
  `${name.replace(/[\\/:*?"<>|]/g, '_').trim() || fallback}.png`;

/** blob 을 파일로 내려받는다 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // 내려받기가 시작된 뒤에 지운다
  setTimeout(() => URL.revokeObjectURL(url));
};

/** shareImage 결과. `cancelled` 는 사용자가 공유 창을 닫은 것 */
export type ShareImageResult = 'shared' | 'copied' | 'cancelled';

/**
 * PNG 를 운영체제의 공유 창(Web Share API)으로 보낸다. 파일 공유를 못 하는 브라우저면 클립보드에 이미지를 복사한다.
 * 공유 · 복사는 누른 직후에만 허락되므로(사용자 동작) 이미지를 만들기 전에 어느 쪽인지 정하고,
 * 복사는 만들 이미지(Promise)를 바로 클립보드에 넘긴다. (Safari 는 기다린 뒤에 복사하면 거절한다)
 */
export const shareImage = async (
  render: () => Promise<Blob>,
  { fileName, title }: { fileName: string; title: string },
): Promise<ShareImageResult> => {
  const type = 'image/png';
  if (navigator.canShare?.({ files: [new File([], fileName, { type })] })) {
    const file = new File([await render()], fileName, { type });
    try {
      await navigator.share({ files: [file], title });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      throw error;
    }
  }
  await navigator.clipboard.write([new ClipboardItem({ [type]: render() })]);
  return 'copied';
};
