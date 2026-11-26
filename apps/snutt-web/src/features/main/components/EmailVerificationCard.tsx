'use client';

import { clsx } from 'clsx';
import { useEffect, useId, useState } from 'react';
import { SNU_MAIL_DOMAIN, useConfirmVerificationCode, useSendVerificationEmail } from '@/api/email-verification';
import { getFailureMessage } from '@/api/errors';
import { Button } from '@/shared/ui/Button';

/** 인증번호를 받은 뒤 입력할 수 있는 시간. Figma 는 `2:48` 로 줄어드는 중이라 3분으로 읽었다 (디자인 문의 4-30) */
const CODE_TTL_SECONDS = 180;
const CODE_LENGTH = 6;

type Step = { type: 'email' } | { type: 'code'; email: string; sentAt: number };

/**
 * 이메일 인증 팝업 (Figma `강의평_인증_메일 입력`, `alert` 3개). 강의평은 서울대 메일을 인증해야 볼 수 있다.
 * 메일 아이디를 받아 인증번호를 보내고, 받은 6자리 번호를 확인한다. 인증되면 강의평을 다시 받는다.
 * Figma 는 흐린 목록 위에 띄우지만 인증 전에는 목록을 받을 수 없어 패널 가운데에 카드로 둔다
 */
export function EmailVerificationCard() {
  const [step, setStep] = useState<Step>({ type: 'email' });
  return (
    // Figma `alert`: 폭 264, 여백 위 36 · 나머지 12, 그림자 0 0 20 검정 10%
    <section
      aria-label="이메일 인증"
      className="mx-auto flex w-66 flex-col items-center rounded-xl bg-normal px-3 pt-9 pb-3 text-center shadow-[0_0_20px_rgb(0_0_0/10%)]"
    >
      <h2 className="text-15-semibold text-normal">이메일 인증</h2>
      {step.type === 'email' ? (
        <EmailStep onSent={(email) => setStep({ type: 'code', email, sentAt: Date.now() })} />
      ) : (
        <CodeStep
          // 인증번호를 다시 보내면 남은 시간을 처음부터 센다
          key={step.sentAt}
          email={step.email}
          sentAt={step.sentAt}
          onResent={() => setStep({ ...step, sentAt: Date.now() })}
          onBack={() => setStep({ type: 'email' })}
        />
      )}
    </section>
  );
}

function EmailStep({ onSent }: { onSent: (email: string) => void }) {
  const [id, setId] = useState('');
  const send = useSendVerificationEmail();
  const errorId = useId();
  const email = `${id.trim()}${SNU_MAIL_DOMAIN}`;
  return (
    <form
      className="flex w-full flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (id.trim() && !send.isPending) send.mutate(email, { onSuccess: () => onSent(email) });
      }}
    >
      <p className="mt-1.5 text-13-regular text-alternative">
        한 번만 인증하면
        <br />
        강의평 서비스를 이용할 수 있어요.
      </p>
      {/* Figma: 입력칸 오른쪽에 `@snu.ac.kr` 를 붙여 둔다 */}
      <div
        className={clsx(
          'mt-5 flex h-9 items-center gap-1 rounded-md border bg-normal px-2 focus-within:border-snutt-mint',
          send.isError ? 'border-warning' : 'border-line-light',
        )}
      >
        <input
          aria-label="메일 아이디"
          aria-describedby={send.isError ? errorId : undefined}
          aria-invalid={send.isError || undefined}
          value={id}
          onChange={(event) => {
            setId(event.target.value);
            send.reset();
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-14-regular text-normal outline-none"
        />
        <span className="text-14-regular text-assistive">{SNU_MAIL_DOMAIN}</span>
      </div>
      {send.isError && (
        <p id={errorId} role="alert" className="mt-1.5 text-left text-12-regular text-warning">
          {getFailureMessage(send.error)}
        </p>
      )}
      <Button type="submit" className="mt-5 w-full" disabled={!id.trim() || send.isPending || send.isError}>
        인증 요청
      </Button>
    </form>
  );
}

type CodeStepProps = { email: string; sentAt: number; onResent: () => void; onBack: () => void };

function CodeStep({ email, sentAt, onResent, onBack }: CodeStepProps) {
  const [code, setCode] = useState('');
  const left = useSecondsLeft(sentAt, CODE_TTL_SECONDS);
  const confirm = useConfirmVerificationCode();
  const resend = useSendVerificationEmail();
  const errorId = useId();
  // 서버가 틀렸다고 답하거나(isEmailVerified false) 거절하면 Figma 문구, 다른 실패는 서버 문구
  const error = confirm.isError
    ? getFailureMessage(confirm.error)
    : confirm.data === false
      ? '인증번호를 다시 확인해주세요.'
      : resend.isError
        ? getFailureMessage(resend.error)
        : null;
  const expired = left === 0;

  return (
    <form
      className="flex w-full flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (code.length === CODE_LENGTH && !expired && !confirm.isPending) confirm.mutate(code);
      }}
    >
      <p className="mt-1.5 text-13-regular break-all text-alternative">
        {email}로 전송된
        <br />
        인증번호를 입력해주세요.
      </p>
      <div
        className={clsx(
          'mt-5 flex h-9 items-center gap-1 rounded-md border bg-normal px-2 focus-within:border-snutt-mint',
          error ? 'border-warning' : 'border-line-light',
        )}
      >
        <input
          aria-label="인증번호"
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          placeholder={`인증번호 ${CODE_LENGTH}자리`}
          value={code}
          onChange={(event) => {
            setCode(event.target.value.replace(/\D/g, ''));
            confirm.reset();
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-14-regular text-normal outline-none placeholder:text-assistive"
        />
        <span aria-label="남은 시간" className="text-14-regular text-warning tabular-nums">
          {formatSeconds(left)}
        </span>
      </div>
      <div className="mt-1.5 flex items-start justify-between gap-2">
        <p id={errorId} role={error ? 'alert' : undefined} className="text-left text-12-regular text-warning">
          {error}
        </p>
        <button
          type="button"
          disabled={resend.isPending}
          onClick={() => resend.mutate(email, { onSuccess: onResent })}
          className="shrink-0 rounded-sm text-12-regular text-alternative underline focus-visible:outline-2 focus-visible:outline-snutt-mint"
        >
          인증번호 재요청
        </button>
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onBack}>
          이전
        </Button>
        <Button type="submit" className="flex-1" disabled={code.length !== CODE_LENGTH || expired || confirm.isPending}>
          확인
        </Button>
      </div>
    </form>
  );
}

/** 보낸 때부터 ttl 초가 지나기까지 남은 초. 1초마다 다시 그린다. 다시 보내면 부르는 쪽을 새로 그린다(key) */
function useSecondsLeft(since: number, ttl: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return Math.max(0, ttl - Math.floor((now - since) / 1000));
}

/** 168 → '2:48' */
const formatSeconds = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
