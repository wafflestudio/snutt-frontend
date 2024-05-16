import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactFacebookFailureResponse, ReactFacebookLoginInfo } from 'react-facebook-login';
import FBLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Layout } from '@/components/layout';
import { envContext } from '@/contexts/EnvContext';
import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenContext } from '@/contexts/tokenContext';
import type { CoreServerError } from '@/entities/error';
import { useGuardContext } from '@/hooks/useGuardContext';
import { queryKey } from '@/utils/query-key-factory';

import { MypageChangePassword } from './mypage-change-password';
import { MypageCloseAccountDialog } from './mypage-close-account-dialog';
import { MypageRegisterId } from './mypage-register-id';

export const MyPage = () => {
  const [isCloseOpen, setCloseOpen] = useState(false);
  const { clearToken } = useTokenContext();
  const { data: myInfo } = useMyInfo();
  const navigate = useNavigate();
  const { timetableViewService, userService } = useGuardContext(serviceContext);
  const { FACEBOOK_APP_ID } = useGuardContext(envContext);
  const [displayMode, setDisplayMode] = useState(timetableViewService.getDisplayMode());

  const { mutate: attach } = useAttachFacebook();
  const { mutate: detach } = useDetachFacebook();

  const isFbOnlyUser = myInfo && userService.isFbOnlyUser(myInfo);

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
        {myInfo?.local_id && (
          <Row data-testid="facebook-row">
            <RowLabel>페이스북</RowLabel>
            {myInfo?.fb_name ? (
              <Button variant="outlined" color="blue" data-testid="facebook-detach-button" onClick={() => detach()}>
                페이스북 연동 해지하기
              </Button>
            ) : (
              // TODO: remove & migrate this library
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
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
  const { userService } = useGuardContext(serviceContext);

  return useQuery({
    queryKey: queryKey('user/info'),
    queryFn: () => userService.getUserInfo(),
  });
};

const useAttachFacebook = () => {
  const { saveToken } = useTokenContext();
  const { errorService } = useGuardContext(serviceContext);
  const { userService } = useGuardContext(serviceContext);

  return useMutation({
    mutationFn: (userInfo: ReactFacebookLoginInfo) => {
      return userService.attachFacebookAccount({ fb_id: userInfo.id, fb_token: userInfo.accessToken });
    },
    onSuccess: ({ token }) => saveToken(token, false),
    onError: (error) => alert(errorService.getErrorMessage((error as unknown as CoreServerError).errcode)),
  });
};

const useDetachFacebook = () => {
  const { saveToken } = useTokenContext();
  const { errorService } = useGuardContext(serviceContext);
  const { userService } = useGuardContext(serviceContext);

  return useMutation({
    mutationFn: () => userService.detachFacebookAccount(),
    onSuccess: ({ token }) => saveToken(token, false),
    onError: (error) => alert(errorService.getErrorMessage((error as unknown as CoreServerError).errcode)),
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
