import { type TokenResponse, useGoogleLogin } from '@react-oauth/google';
import { type UserAuthProviderInfo } from '@sf/snutt-api/src/apis/snutt/schemas';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactFacebookFailureResponse, ReactFacebookLoginInfo } from 'react-facebook-login';
import FBLogin from 'react-facebook-login/dist/facebook-login-render-props';
import KakaoLogin from 'react-kakao-login';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Layout } from '@/components/layout';
import { EnvContext } from '@/contexts/EnvContext';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { TokenManageContext } from '@/contexts/TokenManageContext';
import { type AttachAuthRequest, type AuthProvider } from '@/entities/auth';
import { useGuardContext } from '@/hooks/useGuardContext';

import { MypageChangePassword } from './mypage-change-password';
import { MypageCloseAccountDialog } from './mypage-close-account-dialog';
import { MypageRegisterId } from './mypage-register-id';

export const MyPage = () => {
  const { timetableViewService } = useGuardContext(ServiceContext);
  const { clearToken } = useGuardContext(TokenManageContext);
  const { FACEBOOK_APP_ID, KAKAO_APP_ID } = useGuardContext(EnvContext);

  const [isCloseOpen, setCloseOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState(timetableViewService.getDisplayMode());

  const { data: authProviderInfo } = useMyAuthProviders();
  const navigate = useNavigate();

  const { mutate: attach } = useAttachAuth();
  const { mutate: detach } = useDetachAuth();

  const availableProviders =
    authProviderInfo?.type === 'success'
      ? Object.keys(authProviderInfo.data).filter((key) => authProviderInfo.data[key as keyof UserAuthProviderInfo])
      : [];

  const logout = () => {
    clearToken();
    navigate('/');
  };

  const attachGoogle = useGoogleLogin({
    onSuccess: (tokenResponse: TokenResponse) => attach({ provider: 'GOOGLE', authToken: tokenResponse.access_token }),
  });

  return (
    <Layout>
      <Wrapper>
        <h1>마이페이지</h1>
        <br />
        <Row>
          <RowLabel>시간표 모드</RowLabel>
          <Button
            data-testid="display-mode-toggle"
            variant="outlined"
            onClick={() => {
              const newMode = ({ full: 'real', real: 'full' } as const)[displayMode];
              setDisplayMode(newMode);
              timetableViewService.setDisplayMode(newMode);
            }}
          >
            {displayMode === 'full' ? '실제 시간으로 보기' : '꽉 찬 시간표로 보기'}
          </Button>
        </Row>
        <br />
        {availableProviders.includes('local') ? (
          <Row>
            <RowLabel>비밀번호 관리</RowLabel>
            <MypageChangePassword />
          </Row>
        ) : (
          <Row>
            <RowLabel>아이디 만들기</RowLabel>
            <MypageRegisterId />
          </Row>
        )}
        <br />
        <br />
        <Row data-testid="facebook-row">
          <RowLabel>페이스북</RowLabel>
          {availableProviders.includes('facebook') ? (
            <Button
              style={{ width: '100%' }}
              variant="outlined"
              color="blue"
              data-testid="facebook-detach-button"
              onClick={() => detach('FACEBOOK')}
            >
              페이스북 연동 해지하기
            </Button>
          ) : (
            <FBLogin
              appId={FACEBOOK_APP_ID}
              callback={(userInfo: ReactFacebookLoginInfo) =>
                attach({ provider: 'FACEBOOK', authToken: userInfo.accessToken })
              }
              onFailure={({ status }: ReactFacebookFailureResponse) => alert(status || '')}
              render={({ onClick }) => (
                <Button
                  style={{ width: '100%' }}
                  variant="outlined"
                  color="blue"
                  data-testid="facebook-attach-button"
                  onClick={onClick}
                >
                  페이스북 연동 하기
                </Button>
              )}
            />
          )}
        </Row>
        <Row data-testid="google-row">
          <RowLabel>구글</RowLabel>
          {availableProviders.includes('google') ? (
            <GoogleSignInButton variant="outlined" data-testid="google-detach-button" onClick={() => detach('GOOGLE')}>
              구글 연동 해지하기
            </GoogleSignInButton>
          ) : (
            <GoogleSignInButton onClick={() => attachGoogle()}>구글 연동하기</GoogleSignInButton>
          )}
        </Row>
        <Row data-testid="kakao-row">
          <RowLabel>카카오</RowLabel>
          {availableProviders.includes('kakao') ? (
            <GoogleSignInButton variant="outlined" data-testid="kakao-detach-button" onClick={() => detach('KAKAO')}>
              카카오 연동 해지하기
            </GoogleSignInButton>
          ) : (
            <KakaoLogin
              token={KAKAO_APP_ID}
              onSuccess={({ response }) => attach({ provider: 'KAKAO', authToken: response.access_token })}
              onFail={(e) => console.log(e)}
              render={({ onClick }) => <KakaoSignInButton onClick={onClick}>카카오로 로그인</KakaoSignInButton>}
            />
          )}
        </Row>
        <Row>
          <RowLabel>로그아웃</RowLabel>
          <Button variant="outlined" onClick={logout} color="black">
            로그아웃하기
          </Button>
        </Row>
        <Row>
          <RowLabel>회원 탈퇴</RowLabel>
          <Button variant="outlined" data-testid="mypage-close-account" color="red" onClick={() => setCloseOpen(true)}>
            탈퇴하기
          </Button>
        </Row>
      </Wrapper>
      <MypageCloseAccountDialog isOpen={isCloseOpen} onClose={() => setCloseOpen(false)} />
    </Layout>
  );
};

const useMyAuthProviders = () => {
  const { userService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  return useQuery({
    queryKey: ['UserService', 'getMyAuthProviders', { token }] as const,
    queryFn: ({ queryKey }) => userService.getMyAuthProviders(queryKey[2]),
  });
};

const useAttachAuth = () => {
  const { saveToken } = useGuardContext(TokenManageContext);
  const { userService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  return useMutation({
    mutationFn: (attachAuthRequest: AttachAuthRequest) => {
      return userService.attachAuth({ ...attachAuthRequest, token });
    },
    onSuccess: (data) => {
      if (data.type === 'success') saveToken(data.data.token, false);
      else alert(data.message);
    },
  });
};

const useDetachAuth = () => {
  const { saveToken } = useGuardContext(TokenManageContext);
  const { token } = useGuardContext(TokenAuthContext);
  const { userService } = useGuardContext(ServiceContext);

  return useMutation({
    mutationFn: (provider: AuthProvider) => userService.detachAuth({ provider, token }),
    onSuccess: (data) => {
      if (data.type === 'success') saveToken(data.data.token, false);
      else alert(data.message);
    },
  });
};

const Wrapper = styled.div`
  width: 400px;
  margin: 0 auto;
  padding: 30px 20px 0;
`;

const Row = styled.div`
  min-height: 40px;
  display: flex;
  margin-bottom: 15px;
`;

const RowLabel = styled.div`
  width: 120px;
  min-width: 120px;
  opacity: 0.2;
  font-weight: 700;
  line-height: 40px;
`;

const GoogleSignInButton = styled(Button)`
  padding: 0 24px;
  border-radius: 21px;
  border: none;
  width: 100%;
  height: 34px;
  font-size: 13px;
  background-color: transparent;
  color: #6e6e6e;
  border: 1px solid #6e6e6e;

  &:hover {
    background-color: rgba(60, 93, 212, 0.1);
  }
`;

const KakaoSignInButton = styled(Button)`
  border-radius: 21px;
  border: none;
  width: 100%;
  height: 34px;
  font-size: 13px;
  background-color: transparent;
  color: #d5b045;
  border: 1px solid #d5b045;

  &:hover {
    background-color: rgba(60, 93, 212, 0.1);
  }
`;
