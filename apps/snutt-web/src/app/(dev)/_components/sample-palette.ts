import type { ColorPair } from '@/domain/color';

// 서버의 기본 테마(SNUTT)와 같은 색. 실제로는 시간표 테마 API 에서 받는다
export const SAMPLE_PALETTE: ColorPair[] = [
  '#e54459',
  '#f58d3d',
  '#fac42d',
  '#a6d930',
  '#2bc267',
  '#1bd0c8',
  '#1d99e8',
  '#4f48c4',
  '#af56b3',
].map((bg) => ({ bg, fg: '#ffffff' }));
