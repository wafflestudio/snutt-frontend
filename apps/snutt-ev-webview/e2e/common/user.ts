import { BddStepHelpers } from '../utils/bdd';

export const getUserSteps = ({ setCookie }: BddStepHelpers) => {
  return {
    Given: {
      '이메일 인증된 유저': () => setCookie('x-access-token', '1'),
      '이메일 인증되지 않은 유저': () => setCookie('x-access-token', '2'),
    },
    When: {},
    Then: {},
  };
};
