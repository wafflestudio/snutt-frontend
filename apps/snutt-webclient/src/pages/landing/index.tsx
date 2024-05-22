import { useState } from 'react';
import styled, { css } from 'styled-components';

import { LandingSignUp } from '@/pages/landing/landing-signup';

import { LandingDescription } from './landing-description';
import { LandingLogin } from './landing-login';

export const Landing = () => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  return (
    <Wrapper data-testid="landing">
      <Left />
      {{ LOGIN: <Login onSignUp={() => setMode('SIGNUP')} />, SIGNUP: <SignUp /> }[mode]}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
`;

const Left = styled(LandingDescription)`
  flex: 1;
  overflow-y: auto;
`;

const rightStyle = css`
  width: 428px;
  background-color: #fafafa;
  border-left: 1px solid #efefef;
`;

const Login = styled(LandingLogin)`
  ${rightStyle}
`;

const SignUp = styled(LandingSignUp)`
  ${rightStyle}
`;
