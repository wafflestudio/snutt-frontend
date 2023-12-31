import { bdd } from '../../utils/bdd';

export const mainPageTest = bdd(({ page }) => {
  return {
    Given: {},

    When: {
      '헤더바의 검색 버튼을 클릭한다': () => page.getByTestId('main-search-icon').click(),
    },

    Then: {},
  };
});
