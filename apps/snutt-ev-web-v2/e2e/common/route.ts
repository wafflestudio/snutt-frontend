import { expect } from '@playwright/test';

import { BddHelpers } from '../utils/bdd';

export const getRouteSteps = ({ page }: BddHelpers) => {
  return {
    Given: {},
    When: {
      '화면을 방문한다': (path: string, query?: URLSearchParams) => page.goto(getFullPath(path, query)),
    },
    Then: {
      '화면으로 이동한다': (path: string, query?: URLSearchParams) => expect(page).toHaveURL(getFullPath(path, query)),
    },
  };
};

const getFullPath = (path: string, query?: URLSearchParams) => {
  const fullPath = path + (query?.toString() ? '?' + query.toString() : '');
  return fullPath;
};
