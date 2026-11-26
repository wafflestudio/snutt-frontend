'use client';

import { useQuery } from '@tanstack/react-query';
import { type FormEvent, useId, useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { useSendFeedback, userQueries } from '@/api/users';
import { Button } from '@/shared/ui/Button';
import { Toast } from '@/shared/ui/Toast';
import { MoreSubPage } from './MoreLayout';

// Figma: 입력칸은 Background/light 바탕, 둥글기 10, 여백 20
const FIELD_CLASSES =
  'w-full rounded-[10px] bg-light px-5 text-14-regular text-plain outline-none placeholder:text-med focus-visible:outline-2 focus-visible:outline-snutt-mint';

type FeedbackPageProps = { onBack: () => void; onClose: () => void };

/**
 * 개발자 괴롭히기 (Figma `더보기_개발자 괴롭히기`, `텍스트 작성시 전송 버튼 활성화`): 이메일 주소, 문의내용, 전송.
 * 이메일은 내 계정의 이메일로 채워 두고 고칠 수 있다. 문의내용을 쓰면 전송을 누를 수 있다. 보내면 내용을 비우고 토스트로 알린다.
 */
export function FeedbackPage({ onBack, onClose }: FeedbackPageProps) {
  const id = useId();
  const me = useQuery(userQueries.me());
  // 고치기 전에는 내 계정의 이메일을 보여 준다
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const send = useSendFeedback();
  const emailValue = email ?? me.data?.email ?? '';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    send.mutate(
      { email: emailValue.trim() || null, message: message.trim() },
      {
        onSuccess: () => {
          setMessage('');
          setSent(true);
        },
      },
    );
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="contents">
      <MoreSubPage
        title="개발자 괴롭히기"
        onBack={onBack}
        onClose={onClose}
        footer={
          // Figma: 전송 버튼은 오른쪽 아래, 116 × 38. 문의내용이 비면 흐리게
          <div className="flex items-center justify-end gap-3 px-5 pt-4 pb-8.75">
            {send.isError && <p className="mr-auto text-12-regular text-warning">{getFailureMessage(send.error)}</p>}
            <Button type="submit" className="w-29" disabled={!message.trim() || send.isPending}>
              전송
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-2.5">
          <label htmlFor={`${id}-email`} className="px-4 text-13-regular text-alternative">
            이메일 주소
          </label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={emailValue}
            onChange={(event) => setEmail(event.target.value)}
            className={`h-11.5 ${FIELD_CLASSES}`}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <label htmlFor={`${id}-message`} className="px-4 text-13-regular text-alternative">
            문의내용
          </label>
          <textarea
            id={`${id}-message`}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={'불편한 점이나 버그를 제보해주세요.\n더 나은 SNUTT를 위한 아이디어도 환영해요.'}
            className={`h-92 resize-none py-4 ${FIELD_CLASSES}`}
          />
        </div>
      </MoreSubPage>
      <Toast open={sent} onOpenChange={setSent} message="보냈습니다. 고맙습니다!" />
    </form>
  );
}
