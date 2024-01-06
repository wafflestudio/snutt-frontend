import { cookies } from 'next/headers';

import { createFetchClient } from '@/infrastructures/createFetchClient';
import { createLectureRepository } from '@/infrastructures/createLectureRepository';
import { createLectureService } from '@/infrastructures/createLectureService';

export const getServerServices = () => {
  const cookiesStore = cookies();

  // const baseUrl = 'https://snutt-api-dev.wafflestudio.com/ev-service';
  const mockUrl = 'http://localhost:3000/api/mock-service';
  const token = cookiesStore.get('x-access-token')?.value;
  const apiKey = cookiesStore.get('x-access-apikey')?.value;

  if (!token) throw new Error('Missing token');
  if (!apiKey) throw new Error('Missing apiKey');

  const httpClient = createFetchClient({
    baseUrl: mockUrl,
    headers: { 'x-access-token': token, 'x-access-apikey': apiKey },
  });
  const lectureRepository = createLectureRepository({ httpClient });
  const lectureService = createLectureService({ lectureRepository });

  return { lectureService };
};
