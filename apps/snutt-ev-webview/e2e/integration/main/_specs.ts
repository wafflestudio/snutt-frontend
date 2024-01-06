import { bdd } from '../../utils/bdd';

export const mainPageTest = bdd(({ page }) => {
  return {
    Given: {},

    When: {
      '헤더바의 검색 버튼을 클릭한다': () => page.getByTestId('main-search-icon').click(),

      '지난 학기 강의평 섹션의 강의 목록 링크를 클릭한다': () => page.getByTestId('main-recent-more-link').click(),
    },

    Then: {},
  };
});
