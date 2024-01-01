import { Browser, Page } from '@playwright/test';

import { getRouteSteps, PATH } from '../common/route';
import { getUserSteps } from '../common/user';

type Step = () => void;
type StepGroup = Record<string, Step>;
export type BddRequiredHelpers = { browser: Browser };
export type BddStepHelpers = { setCookie: (name: string, value: string) => Promise<void>; page: Page };

type BddCallback<G extends StepGroup, W extends StepGroup, T extends StepGroup> = (helpers: BddStepHelpers) => {
  Given: G;
  When: W;
  Then: T;
};

type RouteSteps = ReturnType<typeof getRouteSteps>;
type UserSteps = ReturnType<typeof getUserSteps>;

type StepWithCommon<G extends StepGroup, W extends StepGroup, T extends StepGroup> = {
  Given: G & RouteSteps['Given'] & UserSteps['Given'];
  When: W & RouteSteps['When'] & UserSteps['When'];
  Then: T & RouteSteps['Then'] & UserSteps['Then'];
};

export const bdd = <G extends StepGroup, W extends StepGroup, T extends StepGroup>(getSteps: BddCallback<G, W, T>) => {
  return async (
    helpers: BddRequiredHelpers,
    scenario: (stepGroup: StepWithCommon<G, W, T>, helpers: { PATH: typeof PATH }) => Promise<void>,
  ) => {
    const context = await helpers.browser.newContext();
    const page = await context.newPage();

    const stepHelpers: BddStepHelpers = {
      setCookie: (name, value) => context.addCookies([{ name, value, domain: 'localhost', path: '/' }]),
      page,
    };
    const steps = getSteps(stepHelpers);
    const routeSteps = getRouteSteps(stepHelpers);
    const userSteps = getUserSteps(stepHelpers);
    await stepHelpers.setCookie('x-access-apikey', 'key');

    return scenario(
      {
        Given: { ...steps.Given, ...routeSteps.Given, ...userSteps.Given },
        When: { ...steps.When, ...routeSteps.When, ...userSteps.When },
        Then: { ...steps.Then, ...routeSteps.Then, ...userSteps.Then },
      },
      { PATH },
    );
  };
};
