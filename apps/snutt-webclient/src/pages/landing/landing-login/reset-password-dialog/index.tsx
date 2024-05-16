import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { Progress } from '@/components/progress';
import { type AuthService } from '@/usecases/authService';
import { type ErrorService } from '@/usecases/errorService';
import { get } from '@/utils/object/get';

type Props = { open: boolean; onClose: () => void; errorService: ErrorService; authService: AuthService };

enum Step {
  ID_INPUT, //       아이디 입력
  EMAIL_CONFIRM, //  이메일 맞는지 확인
  CODE_INPUT, //     코드 입력
  RESET_PASSWORD, // 비밀번호 초기화
  DONE, //           완료
}

export const LoginResetPasswordDialog = ({ open, onClose, errorService, authService }: Props) => {
  const [id, setId] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(Step.ID_INPUT);

  const checkEmailMutation = useCheckEmail(authService);
  const sendCodeEmailMutation = useSendCodeEmail(authService);
  const verifyCodeMutation = useVerifyCode(authService);
  const resetPasswordMutation = useResetPassword(authService);

  const resetAll = () => {
    setId('');
    setCode('');
    setPassword('');
    setStep(Step.ID_INPUT);
    checkEmailMutation.reset();
    sendCodeEmailMutation.reset();
    verifyCodeMutation.reset();
    resetPasswordMutation.reset();
  };

  const close = () => {
    onClose();
    resetAll();
  };

  return (
    <Dialog open={open} onClose={close}>
      <Dialog.Title>비밀번호 재설정</Dialog.Title>
      <Content>
        {
          {
            [Step.ID_INPUT]: (
              <>
                <StyledProgress progress={0.2} />
                <Info data-testid="login-reset-password-info">아래에 아이디를 입력해 주세요.</Info>
                <Input
                  data-testid="login-reset-password-input"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  disabled={checkEmailMutation.isPending}
                />
                <Error data-testid="login-reset-password-error">
                  {checkEmailMutation.error
                    ? errorService.getErrorMessage(get(checkEmailMutation.error, ['errcode']) as number)
                    : ''}
                </Error>
                <NextButton
                  disabled={!id}
                  data-testid="login-reset-password-cta"
                  size="small"
                  onClick={() =>
                    checkEmailMutation.mutate({ user_id: id }, { onSuccess: () => setStep(Step.EMAIL_CONFIRM) })
                  }
                >
                  다음
                </NextButton>
              </>
            ),
            [Step.EMAIL_CONFIRM]: (
              <>
                <StyledProgress progress={0.4} />
                <Info data-testid="login-reset-password-info">아래 이메일로 인증코드를 전송합니다.</Info>
                <Input data-testid="login-reset-password-input" readOnly value={checkEmailMutation.data?.email} />
                <Error data-testid="login-reset-password-error" />
                <NextButton
                  data-testid="login-reset-password-cta"
                  size="small"
                  onClick={() => {
                    if (!checkEmailMutation.data?.email) return;
                    sendCodeEmailMutation.mutate(
                      { user_email: checkEmailMutation.data?.email },
                      { onSuccess: () => setStep(Step.CODE_INPUT) },
                    );
                  }}
                >
                  전송
                </NextButton>
              </>
            ),
            [Step.CODE_INPUT]: (
              <>
                <StyledProgress progress={0.6} />
                <Info data-testid="login-reset-password-info">인증코드를 입력해주세요.</Info>
                <Input
                  data-testid="login-reset-password-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={verifyCodeMutation.isPending}
                />
                <Error data-testid="login-reset-password-error">
                  {verifyCodeMutation.error
                    ? errorService.getErrorMessage(get(verifyCodeMutation.error, ['errcode']) as number)
                    : ''}
                </Error>
                <NextButton
                  disabled={!code}
                  data-testid="login-reset-password-cta"
                  size="small"
                  onClick={() =>
                    verifyCodeMutation.mutate({ user_id: id, code }, { onSuccess: () => setStep(Step.RESET_PASSWORD) })
                  }
                >
                  다음
                </NextButton>
              </>
            ),
            [Step.RESET_PASSWORD]: (
              <>
                <StyledProgress progress={0.8} />
                <Info data-testid="login-reset-password-info">새 비밀번호를 입력해주세요.</Info>
                <Input
                  data-testid="login-reset-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={resetPasswordMutation.isPending}
                  type="password"
                />
                <Error data-testid="login-reset-password-error" />
                <NextButton
                  data-testid="login-reset-password-cta"
                  size="small"
                  disabled={!password}
                  onClick={() =>
                    resetPasswordMutation.mutate({ user_id: id, password }, { onSuccess: () => setStep(Step.DONE) })
                  }
                >
                  완료
                </NextButton>
              </>
            ),
            [Step.DONE]: (
              <>
                <StyledProgress progress={1} />
                <Info data-testid="login-reset-password-info">비밀번호가 재설정되었습니다.</Info>
                <Info>새로운 비밀번호로 로그인해 주세요.</Info>
                <Error data-testid="login-reset-password-error" />
                <NextButton data-testid="login-reset-password-cta" onClick={close}>
                  닫기
                </NextButton>
              </>
            ),
          }[step]
        }
      </Content>
    </Dialog>
  );
};

const useCheckEmail = (authService: AuthService) => {
  return useMutation({ mutationFn: (body: { user_id: string }) => authService.passwordResetCheckEmail(body) });
};

const useSendCodeEmail = (authService: AuthService) => {
  return useMutation({
    mutationFn: (body: { user_email: string }) => authService.sendPasswordResetVerificationEmail(body),
  });
};

const useVerifyCode = (authService: AuthService) => {
  return useMutation({
    mutationFn: (body: { user_id: string; code: string }) => authService.verifyPasswordResetCode(body),
  });
};

const useResetPassword = (authService: AuthService) => {
  return useMutation({ mutationFn: (body: { user_id: string; password: string }) => authService.resetPassword(body) });
};

const Content = styled(Dialog.Content)`
  width: 300px;
`;

const Info = styled.p`
  margin: 0;
  font-size: 14px;
  height: 40px;
  line-height: 40px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  height: 40px;
  outline: none;
`;

const NextButton = styled(Button).attrs({ size: 'small' })`
  margin-top: 10px;
  width: 100%;
`;

const Error = styled.p`
  margin: 0;
  font-size: 14px;
  height: 40px;
  line-height: 40px;
  color: #d30000;
`;

const StyledProgress = styled(Progress)`
  margin-bottom: 10px;
`;
