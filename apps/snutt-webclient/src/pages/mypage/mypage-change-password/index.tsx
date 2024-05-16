import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { ErrorDialog } from '@/components/error-dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenContext } from '@/contexts/tokenContext';
import { useErrorDialog } from '@/hooks/useErrorDialog';
import { useGuardContext } from '@/hooks/useGuardContext';
import { get } from '@/utils/object/get';

export const MypageChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const { saveToken } = useTokenContext();
  const { authService, errorService } = useGuardContext(serviceContext);

  const { isOpen, message, onClose, open } = useErrorDialog();

  const { mutate } = useChangePassword();

  const onSubmit = async () => {
    if (newPassword !== newPasswordConfirm) {
      open('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (!authService.isValidPassword(newPassword)) {
      open('비밀번호는 영문자, 숫자가 조합된 6자리 이상 20자리 이하여야 합니다.');
      return;
    }

    mutate(
      { old_password: currentPassword, new_password: newPassword },
      {
        onSuccess: ({ token }) => {
          alert('비밀번호가 변경되었습니다.');
          setCurrentPassword('');
          setNewPassword('');
          setNewPasswordConfirm('');
          saveToken(token, false);
        },
        onError: (err) => open(errorService.getErrorMessage(get(err, ['errcode']) as number)),
      },
    );
  };

  return (
    <PasswordWrapper>
      <PasswordInput
        data-testid="mypage-change-password-old"
        placeholder="현재 비밀번호"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <PasswordInput
        data-testid="mypage-change-password-new"
        placeholder="새 비밀번호"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <PasswordInput
        data-testid="mypage-change-password-confirm"
        placeholder="새 비밀번호 확인"
        value={newPasswordConfirm}
        onChange={(e) => setNewPasswordConfirm(e.target.value)}
      />
      <Button
        data-testid="mypage-change-password-submit"
        onClick={onSubmit}
        disabled={!newPassword || !newPasswordConfirm || !currentPassword}
      >
        변경하기
      </Button>
      <ErrorDialog isOpen={isOpen} onClose={onClose} message={message} />
    </PasswordWrapper>
  );
};

const useChangePassword = () => {
  const { authService } = useGuardContext(serviceContext);
  return useMutation({
    mutationFn: (body: { old_password: string; new_password: string }) => authService.changePassword(body),
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
