import { Page } from '@playwright/test';

import { getRouteSteps } from '../common/route';

const PATH = {
  메인: () => '/main',
  검색: () => '/search',
};

type Step = () => void;
type StepGroup = Record<string, Step>;
export type BddHelpers = { page: Page };

type BddCallback<G extends StepGroup, W extends StepGroup, T extends StepGroup> = (helpers: BddHelpers) => {
  Given: G;
  When: W;
  Then: T;
};

type StepWithCommon<G extends StepGroup, W extends StepGroup, T extends StepGroup> = {
  Given: G & ReturnType<typeof getRouteSteps>['Given'];
  When: W & ReturnType<typeof getRouteSteps>['When'];
  Then: T & ReturnType<typeof getRouteSteps>['Then'];
};

export const bdd = <G extends StepGroup, W extends StepGroup, T extends StepGroup>(getSteps: BddCallback<G, W, T>) => {
  return (
    helpers: BddHelpers,
    scenario: (stepGroup: StepWithCommon<G, W, T>, helpers: { PATH: typeof PATH }) => Promise<void>,
  ) => {
    const steps = getSteps(helpers);
    const routeSteps = getRouteSteps(helpers);
    return scenario(
      {
        Given: { ...steps.Given, ...routeSteps.Given },
        When: { ...steps.When, ...routeSteps.When },
        Then: { ...steps.Then, ...routeSteps.Then },
      },
      { PATH },
    );
  };
};
