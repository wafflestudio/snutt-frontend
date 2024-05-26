import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactFacebookFailureResponse, ReactFacebookLoginInfo } from 'react-facebook-login';
import FBLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Layout } from '@/components/layout';
import { EnvContext } from '@/contexts/EnvContext';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { TokenManageContext } from '@/contexts/TokenManageContext';
import { useGuardContext } from '@/hooks/useGuardContext';

import { MypageChangePassword } from './mypage-change-password';
import { MypageCloseAccountDialog } from './mypage-close-account-dialog';
import { MypageRegisterId } from './mypage-register-id';

export const MyPage = () => {
  const [isCloseOpen, setCloseOpen] = useState(false);
  const { clearToken } = useGuardContext(TokenManageContext);
  const { data: myInfo } = useMyInfo();
  const navigate = useNavigate();
  const { timetableViewService, userService } = useGuardContext(ServiceContext);
  const { FACEBOOK_APP_ID } = useGuardContext(EnvContext);
  const [displayMode, setDisplayMode] = useState(timetableViewService.getDisplayMode());

  const { mutate: attach } = useAttachFacebook();
  const { mutate: detach } = useDetachFacebook();

  const isFbOnlyUser = myInfo?.type === 'success' ? userService.isFbOnlyUser(myInfo.data) : undefined;

  const logout = () => {
    clearToken();
    navigate('/');
  };

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
        {isFbOnlyUser ? (
          <Row>
            <RowLabel>아이디 만들기</RowLabel>
            <MypageRegisterId />
          </Row>
        ) : (
          <Row>
            <RowLabel>비밀번호 관리</RowLabel>
            <MypageChangePassword />
          </Row>
        )}
        <br />
        <br />
        {myInfo?.type === 'success' && myInfo.data.localId && (
          <Row data-testid="facebook-row">
            <RowLabel>페이스북</RowLabel>
            {myInfo.data.facebookName ? (
              <Button variant="outlined" color="blue" data-testid="facebook-detach-button" onClick={() => detach()}>
                페이스북 연동 해지하기
              </Button>
            ) : (
              <FBLogin
                appId={FACEBOOK_APP_ID}
                callback={attach}
                onFailure={({ status }: ReactFacebookFailureResponse) => alert(status || '')}
                render={({ onClick }) => (
                  <Button variant="outlined" color="blue" data-testid="facebook-attach-button" onClick={onClick}>
                    페이스북 연동 하기
                  </Button>
                )}
              />
            )}
          </Row>
        )}
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

const useMyInfo = () => {
  const { userService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  return useQuery({
    queryKey: ['UserService', 'getUserInfo', { token }] as const,
    queryFn: ({ queryKey }) => userService.getUserInfo(queryKey[2]),
  });
};

const useAttachFacebook = () => {
  const { saveToken } = useGuardContext(TokenManageContext);
  const { userService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  return useMutation({
    mutationFn: (userInfo: ReactFacebookLoginInfo) => {
      return userService.attachFacebookAccount({ facebookId: userInfo.id, facebookToken: userInfo.accessToken, token });
    },
    onSuccess: (data) => {
      if (data.type === 'success') saveToken(data.data.token, false);
      else alert(data.message);
    },
  });
};

const useDetachFacebook = () => {
  const { saveToken } = useGuardContext(TokenManageContext);
  const { token } = useGuardContext(TokenAuthContext);
  const { userService } = useGuardContext(ServiceContext);

  return useMutation({
    mutationFn: () => userService.detachFacebookAccount({ token }),
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
