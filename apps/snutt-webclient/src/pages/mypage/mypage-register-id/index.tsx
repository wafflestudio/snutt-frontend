import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { ErrorDialog } from '@/components/error-dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenContext } from '@/contexts/tokenContext';
import { useErrorDialog } from '@/hooks/useErrorDialog';
import { useGuardContext } from '@/hooks/useGuardContext';
import { get } from '@/utils/object/get';

export const MypageRegisterId = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { authService, errorService } = useGuardContext(serviceContext);

  const { isOpen, message, onClose, open } = useErrorDialog();

  const { mutate } = useAddIdPassword();

  const onSubmit = async () => {
    if (password !== passwordConfirm) {
      open('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (!authService.isValidPassword(password)) {
      open('비밀번호는 영문자, 숫자가 조합된 6자리 이상 20자리 이하여야 합니다.');
      return;
    }

    mutate({ id, password }, { onError: (err) => open(errorService.getErrorMessage(get(err, ['errcode']) as number)) });
  };

  return (
    <PasswordWrapper>
      <PasswordInput
        data-testid="mypage-add-id-password-id"
        placeholder="아이디"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <PasswordInput
        data-testid="mypage-add-id-password-password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordInput
        data-testid="mypage-add-id-password-password-confirm"
        placeholder="비밀번호 확인"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
      />
      <Button
        data-testid="mypage-add-id-password-submit"
        onClick={onSubmit}
        disabled={!id || !password || !passwordConfirm}
      >
        만들기
      </Button>
      <ErrorDialog isOpen={isOpen} onClose={onClose} message={message} />
    </PasswordWrapper>
  );
};

const useAddIdPassword = () => {
  const { saveToken } = useTokenContext();
  const queryClient = useQueryClient();
  const { userService } = useGuardContext(serviceContext);

  return useMutation({
    mutationFn: (body: { id: string; password: string }) => userService.addIdPassword(body),
    onSuccess: ({ token }) => {
      saveToken(token, false);
      return queryClient.invalidateQueries();
    },
  });
};

const PasswordInput = styled.input.attrs({ type: 'password' })`
  height: 40px;
  margin-bottom: 10px;
  background-color: transparent;
  border: none;
  outline: none;
  border-bottom: 1px solid #ebeef2;
  font-size: 14px;
  width: 100%;
  transition: 0.2s border-bottom;

  &:focus {
    border-bottom: 1px solid #bfc1c5;
  }
`;

const PasswordWrapper = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: end;
`;
