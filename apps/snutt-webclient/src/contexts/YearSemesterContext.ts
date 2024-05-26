import { createContext } from 'react';

import { type Semester } from '@/entities/semester';

type YearSemesterContext = { year: number; semester: Semester };

export const YearSemesterContext = createContext<YearSemesterContext | null>(null);
