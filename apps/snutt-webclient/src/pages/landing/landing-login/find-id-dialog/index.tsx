import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { type AuthService } from '@/usecases/authService';
import { type ErrorService } from '@/usecases/errorService';
import { get } from '@/utils/object/get';

type Props = { open: boolean; onClose: () => void; errorService: ErrorService; authService: AuthService };

export const LoginFindIdDialog = ({ open, onClose, errorService, authService }: Props) => {
  const [email, setEmail] = useState('');
  const { mutate, isSuccess, error, reset, status } = useFindId(authService);

  const isValid = !!email;

  const close = () => {
    onClose();
    setEmail('');
    reset();
  };

  return (
    <Dialog open={open} onClose={close}>
      <Dialog.Title>아이디 찾기</Dialog.Title>
      <Content>
        <Info>아래에 이메일을 입력해 주세요.</Info>
        <EmailInput data-testid="login-find-id-email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Result $status={status} data-testid="login-find-id-result">
          {isSuccess
            ? '이메일이 전송되었어요'
            : error
              ? errorService.getErrorMessage(get(error, ['errcode']) as number)
              : ''}
        </Result>
      </Content>
      <Dialog.Actions>
        <Button data-testid="login-find-id-cancel" size="small" color="gray" onClick={close}>
          닫기
        </Button>
        <Button
          data-testid="login-find-id-submit"
          disabled={!isValid || isSuccess}
          size="small"
          onClick={() => mutate({ email })}
        >
          전송
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const useFindId = (authService: AuthService) => {
  return useMutation({ mutationFn: (body: { email: string }) => authService.findIdByEmail(body) });
};

const Content = styled(Dialog.Content)`
  width: 300px;
`;

const Info = styled.p`
  margin: 0 0 8px;
  font-size: 14px;
`;

const EmailInput = styled.input`
  width: 100%;
  padding: 8px 12px;
`;

const Result = styled.p<{ $status: 'success' | 'error' | 'idle' | 'pending' }>`
  margin: 8px 0 0;
  height: 20px;
  font-size: 14px;
  color: ${({ $status }) => ({ success: '#160bdf', error: '#600303', idle: '#000', pending: '#000' })[$status]};
`;
