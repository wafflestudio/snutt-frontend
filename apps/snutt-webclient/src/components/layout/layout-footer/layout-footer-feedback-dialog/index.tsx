import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import styled, { css } from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { serviceContext } from '@/contexts/ServiceContext';
import { useGuardContext } from '@/hooks/useGuardContext';

type Props = { isOpen: boolean; onClose: () => void };

export const LayoutFooterFeedbackDialog = ({ onClose, isOpen }: Props) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const { mutate, isPending, isSuccess, reset } = useSubmitFeedback();

  const isValid = email && message;

  const submit = () => {
    if (!isValid || isPending) return;
    mutate({ email, message });
  };

  const close = () => {
    setEmail('');
    setMessage('');
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={close}>
      <Dialog.Title>피드백을 남겨주세요</Dialog.Title>
      <Content>
        <label>이메일</label>
        <Input
          disabled={isPending || isSuccess}
          data-testid="feedback-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
        />
        <label>내용</label>
        <Textarea
          disabled={isPending || isSuccess}
          data-testid="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="버그, 개선사항 등등"
        />
      </Content>
      {!isSuccess ? (
        <Dialog.Actions>
          <Button size="small" color="gray" data-testid="feedback-cancel" onClick={close}>
            취소
          </Button>
          <Button loading={isPending} size="small" data-testid="feedback-submit" onClick={submit} disabled={!isValid}>
            제출
          </Button>
        </Dialog.Actions>
      ) : (
        <Dialog.Actions>
          <span>피드백이 전달되었어요</span>
          <Button size="small" data-testid="feedback-close" onClick={close}>
            닫기
          </Button>
        </Dialog.Actions>
      )}
    </Dialog>
  );
};

const useSubmitFeedback = () => {
  const { feedbackService } = useGuardContext(serviceContext);
  return useMutation({ mutationFn: (body: { email: string; message: string }) => feedbackService.post(body) });
};

const Content = styled(Dialog.Content)`
  display: flex;
  flex-direction: column;
  width: 500px;
`;

const inputStyle = css`
  padding: 6px 12px;
  outline: none;
  border-radius: 4px;
  border: 1px solid #babaca;
  margin-top: 10px;
  font-size: 14px;
`;

const Input = styled.input`
  margin-bottom: 30px;
  ${inputStyle}
`;

const Textarea = styled.textarea`
  height: 100px;
  ${inputStyle}
`;
