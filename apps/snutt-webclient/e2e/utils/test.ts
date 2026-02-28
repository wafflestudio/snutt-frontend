import { type Page, test as base } from '@playwright/test';

export const test = base.extend<{ page: Page }>({
  async page({ page }, use) {
    await page.addStyleTag({
      content: `
*,
*::before,
*::after {
  transition-property: none !important;
  transform: none !important;
  animation: none !important;
}
  `,
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';
