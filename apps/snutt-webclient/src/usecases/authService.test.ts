import { expect, test } from '@jest/globals';

import { getAuthService } from './authService';

const authService = getAuthService({
  repositories: [],
  services: [{ getBaseUrl: () => '', getApiKey: () => '' }],
} as unknown as Parameters<typeof getAuthService>[0]);

test('isValidPassword', () => {
  expect(authService.isValidPassword('')).toStrictEqual(false);
  expect(authService.isValidPassword('qwer')).toStrictEqual(false);
  expect(authService.isValidPassword('qwer1')).toStrictEqual(false);
  expect(authService.isValidPassword('qwer11')).toStrictEqual(true);
  expect(authService.isValidPassword('우현민바보')).toStrictEqual(false);
  expect(authService.isValidPassword('asdfadfadfasldfjlisjdiflj1df')).toStrictEqual(false);
});
