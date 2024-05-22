import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenAuthContext } from '@/contexts/TokenAuthContext';
import { useGuardContext } from '@/hooks/useGuardContext';

export const LayoutProfile = () => {
  const { data: myInfo } = useMyInfo();

  const isTempUser = myInfo && myInfo.type === 'success' && !myInfo.data.localId && !myInfo.data.facebookName;
  const isLoginButton = isTempUser;

  return isLoginButton ? (
    <ProfileText to="/login" data-testid="layout-my-info">
      로그인
    </ProfileText>
  ) : (
    <ProfileText to="/mypage" data-testid="layout-my-info">
      {myInfo?.type === 'success' && `${myInfo.data.localId ?? myInfo.data.facebookName}님`}
    </ProfileText>
  );
};

const useMyInfo = () => {
  const { userService } = useGuardContext(serviceContext);
  const { token } = useTokenAuthContext();

  return useQuery({
    queryKey: ['UserService', 'getUserInfo', { token }] as const,
    queryFn: ({ queryKey }) => userService.getUserInfo(queryKey[2]),
  });
};

const ProfileText = styled(Link)`
  text-decoration: none;
  color: black;
  opacity: 0.8;
  transition: opacity 0.2s;
  width: 80px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    opacity: 1;
  }
`;
