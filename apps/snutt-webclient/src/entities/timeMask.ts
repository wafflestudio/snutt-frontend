import type { Hour24 } from './time';

export type Position = { i: number; j: number };
export type CellStatus = boolean[][];
export type DragMode = 'add' | 'remove';
export type TimeMask = [number, number, number, number, number, number, number];
export const timeMaskHours: Hour24[] = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
