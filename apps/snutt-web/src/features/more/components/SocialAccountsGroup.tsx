'use client';

import { useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { useLinkSocial, useUnlinkSocial } from '@/api/users';
import { SOCIAL_PROVIDER_LABELS, SOCIAL_PROVIDERS, type SocialProvider, type User } from '@/domain/user';
import {
  getPopupAccessToken,
  isSocialLoginProvider,
  SocialAuthCancelled,
  SocialAuthError,
  startKakaoAuth,
} from '@/shared/lib/social-auth';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog, NoticeDialog } from '@/shared/ui/Dialog';
import { MoreCardRow, MoreGroup, MoreValue } from './MoreLayout';

type SocialAccountsGroupProps = {
  user: User;
  /** 연동 · 해제가 끝났을 때 알릴 말 */
  onDone: (message: string) => void;
};

/**
 * `SNS 계정 연동 및 해제` (Figma `더보기_내 계정`). 연동된 계정은 `연동됨` 과 해제 버튼, 아니면 연동하기 버튼.
 * - 구글 · 페이스북은 팝업에서 토큰을 받아 바로 연동하고, 카카오는 카카오 화면에 다녀와 `/oauth/kakao` 가 연동한 뒤 이 화면으로 돌아온다.
 * - 애플은 웹 로그인을 붙이지 않아 연동은 앱에서만 할 수 있다. 해제는 토큰이 필요 없어 웹에서도 할 수 있다.
 * - Figma 에는 `연동됨` · `연동하기` 글자만 있어 버튼 모양은 임시다 (디자인 문의 4-12)
 */
export function SocialAccountsGroup({ user, onDone }: SocialAccountsGroupProps) {
  const link = useLinkSocial();
  const unlink = useUnlinkSocial();
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [confirmUnlink, setConfirmUnlink] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = pending !== null || link.isPending || unlink.isPending;

  const startLink = async (provider: SocialProvider) => {
    if (!isSocialLoginProvider(provider)) return;
    setPending(provider);
    try {
      if (provider === 'kakao')
        // 다녀와서 지금 화면(더보기 → 내 계정)으로 돌아온다. 페이지를 떠나므로 버튼을 막아 둔 채로 둔다
        return startKakaoAuth({ purpose: 'link', next: window.location.pathname + window.location.search });
      const token = await getPopupAccessToken(provider);
      await link.mutateAsync({ provider, token });
      setPending(null);
      onDone(`${SOCIAL_PROVIDER_LABELS[provider]}을 연동했습니다`);
    } catch (failure) {
      setPending(null);
      if (failure instanceof SocialAuthCancelled) return;
      setError(failure instanceof SocialAuthError ? failure.message : getFailureMessage(failure as Error));
    }
  };

  const doUnlink = (provider: SocialProvider) =>
    unlink.mutate(provider, {
      onSuccess: () => onDone(`${SOCIAL_PROVIDER_LABELS[provider]} 연동을 해제했습니다`),
      onError: (failure) => setError(getFailureMessage(failure)),
    });

  return (
    <MoreGroup label="SNS 계정 연동 및 해제">
      {SOCIAL_PROVIDERS.map((provider) => (
        <MoreCardRow key={provider} label={SOCIAL_PROVIDER_LABELS[provider]}>
          {user.providers.includes(provider) ? (
            <span className="flex items-center gap-2">
              <MoreValue>연동됨</MoreValue>
              <Button
                variant="outline"
                size="sm"
                aria-label={`${SOCIAL_PROVIDER_LABELS[provider]} 연동 해제`}
                disabled={busy}
                onClick={() => setConfirmUnlink(provider)}
              >
                해제
              </Button>
            </span>
          ) : isSocialLoginProvider(provider) ? (
            <Button
              variant="outline"
              size="sm"
              aria-label={`${SOCIAL_PROVIDER_LABELS[provider]} 연동하기`}
              disabled={busy}
              onClick={() => void startLink(provider)}
            >
              연동하기
            </Button>
          ) : (
            <MoreValue>앱에서 연동할 수 있습니다</MoreValue>
          )}
        </MoreCardRow>
      ))}

      <ConfirmDialog
        open={confirmUnlink !== null}
        onOpenChange={(open) => !open && setConfirmUnlink(null)}
        message={confirmUnlink && `${SOCIAL_PROVIDER_LABELS[confirmUnlink]} 연동을\n해제하시겠습니까?`}
        confirmLabel="해제"
        onConfirm={() => confirmUnlink && doUnlink(confirmUnlink)}
      />
      <NoticeDialog open={error !== null} onOpenChange={(open) => !open && setError(null)} message={error} />
    </MoreGroup>
  );
}
