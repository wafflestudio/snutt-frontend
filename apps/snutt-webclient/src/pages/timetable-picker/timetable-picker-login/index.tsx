import { type TokenResponse, useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { type ReactFacebookFailureResponse, type ReactFacebookLoginInfo } from 'react-facebook-login';
import FBLogin from 'react-facebook-login/dist/facebook-login-render-props';
import KakaoLogin from 'react-kakao-login';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { IcLogo } from '@/components/icons/ic-logo';
import { EnvContext } from '@/contexts/EnvContext';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenManageContext } from '@/contexts/TokenManageContext';
import { useGuardContext } from '@/hooks/useGuardContext';

export const TimetablePickerLogin = () => {
  const { saveToken } = useGuardContext(TokenManageContext);
  const { FACEBOOK_APP_ID, KAKAO_APP_ID } = useGuardContext(EnvContext);
  const { authService } = useGuardContext(ServiceContext);

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignIn, setKeepSignIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async () => {
    setErrorMessage('');
    const res = await authService.signIn({ type: 'LOCAL', id, password });
    if (res.type === 'success') saveToken(res.data.token, keepSignIn);
    else setErrorMessage(res.message);
  };

  const handleSocialLogin = async (provider: 'FACEBOOK' | 'KAKAO' | 'GOOGLE', token: string) => {
    setErrorMessage('');
    const res = await authService.signIn({ type: provider, token });
    if (res.type === 'success') saveToken(res.data.token, keepSignIn);
    else setErrorMessage(res.message);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse: TokenResponse) => handleSocialLogin('GOOGLE', tokenResponse.access_token),
  });

  return (
    <Wrapper>
      <Container>
        <Title>
          <IcLogo width={26} height={26} />
          <TitleText>SNUTT</TitleText>
        </Title>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignIn();
          }}
        >
          <InputGroup>
            <Label>아이디</Label>
            <Input
              autoComplete="id"
              placeholder="아이디"
              value={id}
              onChange={(e) => setId(e.target.value)}
              data-testid="id-input"
            />
          </InputGroup>

          <InputGroup>
            <Label>비밀번호</Label>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="password-input"
            />
          </InputGroup>

          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

          <CheckboxGroup>
            <input
              type="checkbox"
              checked={keepSignIn}
              onChange={(e) => setKeepSignIn(e.target.checked)}
              id="keep-signin"
            />
            <label htmlFor="keep-signin">로그인 상태 유지</label>
          </CheckboxGroup>

          <SignInButton type="submit" data-testid="sign-in-button">
            로그인
          </SignInButton>
        </Form>

        <Divider>또는</Divider>

        <SocialButtonsGroup>
          <FBLogin
            appId={FACEBOOK_APP_ID}
            autoLoad={false}
            fields="name,email,picture"
            render={(renderProps) => (
              <FacebookButton onClick={renderProps.onClick} data-testid="facebook-login">
                Facebook로 로그인
              </FacebookButton>
            )}
            callback={(response: ReactFacebookLoginInfo | ReactFacebookFailureResponse) => {
              if ('accessToken' in response) {
                handleSocialLogin('FACEBOOK', response.accessToken);
              }
            }}
          />

          <GoogleButton onClick={() => googleLogin()} data-testid="google-login">
            Google로 로그인
          </GoogleButton>

          <KakaoLogin
            token={KAKAO_APP_ID}
            render={(renderProps) => (
              <KakaoButton onClick={renderProps.onClick} data-testid="kakao-login">
                Kakao로 로그인
              </KakaoButton>
            )}
            onSuccess={(response) => handleSocialLogin('KAKAO', response.response.access_token)}
            onFail={() => setErrorMessage('카카오 로그인에 실패했습니다')}
          />
        </SocialButtonsGroup>
      </Container>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: rgb(247, 248, 249);
`;

const Container = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px 32px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 0 32px 0;
`;

const TitleText = styled.span`
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1;
  /* 대문자 워드마크는 글리프가 라인박스 위쪽에 쏠려 로고보다 위로 떠 보이므로
     광학적 중앙을 맞추기 위해 살짝 아래로 내린다. */
  transform: translateY(2px);
`;

const Form = styled.form`
  width: 100%;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid rgb(224, 224, 224);
  border-radius: 4px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
`;

const ErrorMessage = styled.div`
  padding: 12px;
  margin-bottom: 16px;
  background-color: #ffebee;
  border: 1px solid #ef5350;
  border-radius: 4px;
  color: #c62828;
  font-size: 14px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;

  input[type='checkbox'] {
    cursor: pointer;
  }

  label {
    cursor: pointer;
  }
`;

const SignInButton = styled(Button).attrs({ variant: 'contained' })`
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
`;

const Divider = styled.div`
  text-align: center;
  margin: 24px 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.54);

  &::before,
  &::after {
    content: '';
    display: inline-block;
    width: 35%;
    height: 1px;
    background-color: rgb(224, 224, 224);
    vertical-align: middle;
  }

  &::before {
    margin-right: 12px;
  }

  &::after {
    margin-left: 12px;
  }
`;

const SocialButtonsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SocialButton = styled(Button).attrs({ variant: 'outlined' })`
  width: 100%;
  padding: 10px 16px;
  font-size: 14px;
`;

const FacebookButton = styled(SocialButton)`
  border-color: #1877f2;
  color: #1877f2;

  &:hover {
    background-color: rgba(24, 119, 242, 0.05);
  }
`;

const GoogleButton = styled(SocialButton)`
  border-color: #1f2937;
  color: #1f2937;

  &:hover {
    background-color: rgba(31, 41, 55, 0.05);
  }
`;

const KakaoButton = styled(SocialButton)`
  border-color: #ffe812;
  color: #ffa500;

  &:hover {
    background-color: rgba(255, 232, 18, 0.05);
  }
`;
