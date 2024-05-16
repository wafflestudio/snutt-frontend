import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import { useTokenContext } from '@/contexts/tokenContext';
import { useGuardContext } from '@/hooks/useGuardContext';
import { get } from '@/utils/object/get';

const CONFIRM_TEXT = '탈퇴';

type Props = { isOpen: boolean; onClose: () => void };

export const MypageCloseAccountDialog = ({ onClose, isOpen }: Props) => {
  const [confirmText, setConfirmText] = useState('');
  const { clearToken } = useTokenContext();
  const { mutate } = useCloseAccount();
  const navigate = useNavigate();

  const isValid = confirmText === CONFIRM_TEXT;

  const close = () => {
    setConfirmText('');
    onClose();
  };

  const onSubmit = async () => {
    if (!isValid) return;
    mutate(undefined, {
      onSuccess: () => {
        clearToken();
        close();
        navigate('/');
      },
      onError: (err) => console.log(get(err, ['errcode'])),
    });
  };

  return (
    <Dialog open={isOpen} onClose={close}>
      <Dialog.Title>정말 탈퇴하시겠습니까?</Dialog.Title>
      <Dialog.Content style={{ width: 300 }}>
        <Input
          data-testid="mypage-close-account-input"
          placeholder={CONFIRM_TEXT}
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
        <Caption>위 입력창에 "탈퇴" 라고 입력해 주세요.</Caption>
      </Dialog.Content>
      <Dialog.Actions>
        <Button color="gray" size="small" data-testid="mypage-close-account-cancel" onClick={close}>
          취소
        </Button>
        <Button size="small" data-testid="mypage-close-account-submit" onClick={onSubmit} disabled={!isValid}>
          탈퇴
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const useCloseAccount = () => {
  const { authService } = useGuardContext(serviceContext);
  return useMutation({
    mutationFn: () => authService.closeAccount(),
  });
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

const Caption = styled.p`
  font-size: 12px;
  color: #000;
  opacity: 0.8;
  text-align: right;
  margin: 4px 0;
`;
