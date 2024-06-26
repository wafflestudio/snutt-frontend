import { type SnuttApi } from '@sf/snutt-api';

export const mockVividIos: (Awaited<ReturnType<SnuttApi['GET /v1/colors/vivid_ios']>> & { status: 200 })['data'] = {
  message: 'ok',
  colors: [
    { fg: '#ffffff', bg: '#e54459' },
    { fg: '#ffffff', bg: '#f58d3d' },
    { fg: '#ffffff', bg: '#fac52d' },
    { fg: '#ffffff', bg: '#a6d930' },
    { fg: '#ffffff', bg: '#2bc366' },
    { fg: '#ffffff', bg: '#1bd0c9' },
    { fg: '#ffffff', bg: '#1d99e9' },
    { fg: '#ffffff', bg: '#4f48c4' },
    { fg: '#ffffff', bg: '#af56b3' },
  ],
  names: ['석류', '감귤', '들국', '완두', '비취', '지중해', '하늘', '라벤더', '자수정'],
};
