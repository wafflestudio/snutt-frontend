import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { ErrorDialog } from '@/components/error-dialog';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenManageContext } from '@/contexts/TokenManageContext';
import { useErrorDialog } from '@/hooks/useErrorDialog';
import { useGuardContext } from '@/hooks/useGuardContext';

export const LandingSignUp = ({ className }: { className?: string }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const { authService } = useGuardContext(ServiceContext);

  const { isOpen, message, onClose, open } = useErrorDialog();
  const { saveToken } = useGuardContext(TokenManageContext);
  const { mutate } = useSignUp();

  const onSubmit = async () => {
    if (password !== passwordConfirm) {
      open('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (!authService.isValidPassword(password)) {
      open('비밀번호는 영문자, 숫자가 조합된 6자리 이상 20자리 이하여야 합니다.');
      return;
    }

    mutate(
      { id, password },
      { onSuccess: (data) => (data.type === 'success' ? saveToken(data.data.token, false) : open(data.message)) },
    );
  };

  return (
    <PasswordWrapper
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <h1>회원가입</h1>

      <Input data-testid="signup-id" placeholder="id" value={id} onChange={(e) => setId(e.target.value)} />
      <Input
        type="password"
        data-testid="signup-pw"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        type="password"
        data-testid="signup-pwc"
        placeholder="비밀번호 확인"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
      />

      <br />

      <Button data-testid="signup-submit" disabled={!id || !password || !passwordConfirm}>
        가입하기
      </Button>
      <ErrorDialog message={message} isOpen={isOpen} onClose={onClose} />
    </PasswordWrapper>
  );
};

const useSignUp = () => {
  const { authService } = useGuardContext(ServiceContext);
  return useMutation({ mutationFn: (body: { id: string; password: string }) => authService.signUp(body) });
};

const Input = styled.input`
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

const PasswordWrapper = styled.form`
  display: flex;
  width: 100%;
  flex-direction: column;

  width: 400px;
  margin: 0 auto;
  padding: 100px 20px 200px;
`;
