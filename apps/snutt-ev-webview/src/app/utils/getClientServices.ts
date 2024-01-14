'use client';
import Cookies from 'js-cookie';

import { createEvaluationService } from '@/infrastructures/createEvaluationService';
import { createEvaluationRepository } from '@/infrastructures/createEvalutionRepository';
import { createFetchClient } from '@/infrastructures/createFetchClient';

export const getClientServices = () => {
  const baseUrl = 'https://snutt-api-dev.wafflestudio.com/ev-service';
  // const mockUrl = 'http://localhost:3000/api/mock-service';
  const token = Cookies.get('x-access-token');
  const apiKey = Cookies.get('x-access-apikey');

  if (!token) throw new Error('Missing token');
  if (!apiKey) throw new Error('Missing apiKey');

  const httpClient = createFetchClient({
    baseUrl: baseUrl,
    headers: { 'x-access-token': token, 'x-access-apikey': apiKey },
  });

  const evaluationRepository = createEvaluationRepository({ httpClient });
  const evaluationService = createEvaluationService({ evaluationRepository });

  return { evaluationService };
};
