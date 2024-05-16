import { useState } from 'react';
import { type ReactFacebookFailureResponse, type ReactFacebookLoginInfo } from 'react-facebook-login';
import FBLogin from 'react-facebook-login/dist/facebook-login-render-props';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { envContext } from '@/contexts/EnvContext';
import { useTokenContext } from '@/contexts/tokenContext';
import { type CoreServerError } from '@/entities/error';
import { useGuardContext } from '@/hooks/useGuardContext';
import { LoginFindIdDialog } from '@/pages/landing/landing-login/find-id-dialog';
import { LoginResetPasswordDialog } from '@/pages/landing/landing-login/reset-password-dialog';
import { type AuthService } from '@/usecases/authService';
import { type ErrorService } from '@/usecases/errorService';

type Props = { className?: string; authService: AuthService; errorService: ErrorService; onSignUp: () => void };

export const LandingLogin = ({ className, authService, errorService, onSignUp }: Props) => {
  const { saveToken } = useTokenContext();
  const { FACEBOOK_APP_ID } = useGuardContext(envContext);
  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [keepSignIn, setKeepSignIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [findIdDialogOpen, setFindIdDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

  const handleSignIn = async () => {
    setErrorMessage('');

    try {
      const res = await authService.signIn({ type: 'LOCAL', id, password });

      saveToken(res.token, keepSignIn);
    } catch (error) {
      const errorCode = (error as CoreServerError).errcode;

      setErrorMessage(errorService.getErrorMessage(errorCode));
    }
  };

  const handleFacebookSignIn = async (userInfo: ReactFacebookLoginInfo) => {
    setErrorMessage('');

    try {
      const res = await authService.signIn({ type: 'FACEBOOK', fb_id: userInfo.id, fb_token: userInfo.accessToken });

      saveToken(res.token, keepSignIn);
    } catch (error) {
      const errorCode = (error as CoreServerError).errcode;

      setErrorMessage(errorService.getErrorMessage(errorCode));
    }
  };

  return (
    <Wrapper className={className}>
      <h3>시작하기</h3>

      <div style={{ width: '100%', marginTop: '60px' }}>
        <label style={{ fontSize: '14px' }}>아이디</label>
        <Input placeholder="아이디" value={id} onChange={(e) => setId(e.target.value)} data-testid="id-input" />
      </div>
      <div style={{ width: '100%', marginTop: '20px' }}>
        <label style={{ fontSize: '14px' }}>비밀번호</label>
        <Input
          placeholder="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
          data-testid="password-input"
        />
      </div>
      <CheckboxWrapper>
        <Checkbox id="keepSignIn" checked={keepSignIn} onChange={(e) => setKeepSignIn(e.target.checked)} />
        <Label htmlFor="keepSignIn">로그인 유지</Label>
      </CheckboxWrapper>
      <ErrorMessage data-testid="error-message">{errorMessage}</ErrorMessage>
      <LocalSignInButton disabled={!(id && password)} onClick={handleSignIn} data-testid="local-signin-button">
        로그인
      </LocalSignInButton>
      {/* TODO: migrate to another library */}
      {/* eslint-disable-next-line */}
      {/* @ts-ignore */}
      <FBLogin
        appId={FACEBOOK_APP_ID}
        callback={handleFacebookSignIn}
        onFailure={({ status }: ReactFacebookFailureResponse) => setErrorMessage(status || '')}
        render={({ onClick }) => <FBSignInButton onClick={onClick}>facebook으로 로그인</FBSignInButton>}
      />
      <EtcWrapper>
        <FindWrapper>
          <OtherButton data-testid="login-find-id" onClick={() => setFindIdDialogOpen(true)}>
            아이디 찾기
          </OtherButton>
          <Divider />
          <OtherButton data-testid="login-reset-password" onClick={() => setResetPasswordDialogOpen(true)}>
            비밀번호 재설정
          </OtherButton>
        </FindWrapper>
        <OtherButton data-testid="login-signup-link" onClick={onSignUp}>
          회원가입
        </OtherButton>
      </EtcWrapper>
      <LoginFindIdDialog
        authService={authService}
        errorService={errorService}
        open={findIdDialogOpen}
        onClose={() => setFindIdDialogOpen(false)}
      />
      <LoginResetPasswordDialog
        authService={authService}
        errorService={errorService}
        open={resetPasswordDialogOpen}
        onClose={() => setResetPasswordDialogOpen(false)}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 50px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  margin: 10px 0 10px;

  border: 0;
  border-bottom: 1px solid #ebeef2;

  background-color: transparent;
  font-size: 14px;

  &:focus {
    outline: none;
    box-shadow: none;
    border-color: #b7c3ce;
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.2);
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  width: 100%;
  margin-top: 10px;
`;

// 정확한 색상  파악 필요
const Label = styled.label`
  font-size: 14px;
  font-weight: 400;
  color: #333;
  opacity: 0.7;
  cursor: pointer;

  &:hover {
    color: #1bd0c9;
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-top: 0;
  cursor: pointer;
`;

const ErrorMessage = styled.span`
  color: #d13d37;
  text-align: center;
  margin: 20px 0;
`;

const OtherButton = styled.button`
  padding: 0;
  font-size: 14px;
  text-decoration: none;
  color: #000;
  opacity: 0.6;
  transition: 0.1s opacity;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
  background: transparent;
  border: none;
  cursor: pointer;
`;

const EtcWrapper = styled.div`
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
`;

const FindWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const Divider = styled.div`
  width: 1px;
  height: 12px;
  background-color: #888888;
`;

const LocalSignInButton = styled(Button)`
  border-radius: 21px;
  border: none;
  width: 100%;
  margin-top: 10px;
  height: 34px;
  font-size: 13px;
  background-color: transparent;

  color: #fff;
  background-color: #1bd0c9;
`;

const FBSignInButton = styled(Button)`
  border-radius: 21px;
  border: none;
  width: 100%;
  margin-top: 10px;
  height: 34px;
  font-size: 13px;
  background-color: transparent;
  color: #3c5dd4;
  border: 1px solid #3c5dd4;

  &:hover {
    background-color: rgba(60, 93, 212, 0.1);
  }
`;
