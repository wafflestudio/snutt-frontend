'use client';

import { useQuery } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { getFailureMessage } from '@/api/errors';
import { useDeleteAccount, userQueries, useUpdateNickname } from '@/api/users';
import { formatNicknameWithTag } from '@/domain/friend';
import { hasLocalAccount, type User } from '@/domain/user';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog, NoticeDialog } from '@/shared/ui/Dialog';
import { IconButton } from '@/shared/ui/IconButton';
import { IconEdit } from '@/shared/ui/icons';
import { TextField } from '@/shared/ui/TextField';
import { Toast } from '@/shared/ui/Toast';
import { MoreCard, MoreCardButtonRow, MoreCardRow, MoreGroup, MoreSubPage, MoreValue } from './MoreLayout';
import { PasswordDialog } from './PasswordDialog';
import { SocialAccountsGroup } from './SocialAccountsGroup';

type AccountPageProps = { onBack: () => void; onClose: () => void };

/**
 * 내 계정 (Figma `더보기_내 계정`): 닉네임(고치기), 보안(비밀번호 변경), 이메일, SNS 계정 연동 및 해제, 계정삭제.
 * - 아이디: v2 내 정보에 아이디(localId)가 없어 줄을 뺐다 (디자인 문의 4-32)
 * - SNS 연동 · 해제: SocialAccountsGroup
 */
export function AccountPage({ onBack, onClose }: AccountPageProps) {
  const me = useQuery(userQueries.me());

  return (
    <MoreSubPage title="내 계정" onBack={onBack} onClose={onClose}>
      {me.data ? (
        <AccountDetails user={me.data} />
      ) : (
        <p className="px-1.5 text-14-regular text-alternative">
          {me.isError ? `내 정보를 불러오지 못했습니다. ${getFailureMessage(me.error)}` : '불러오는 중'}
        </p>
      )}
    </MoreSubPage>
  );
}

function AccountDetails({ user }: { user: User }) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const deleteAccount = useDeleteAccount();

  return (
    <>
      <NicknameCard user={user} onSaved={() => setToast('닉네임을 바꿨습니다')} />

      {hasLocalAccount(user) && (
        <MoreGroup label="보안">
          <MoreCardButtonRow label="비밀번호 변경" onClick={() => setPasswordOpen(true)} />
        </MoreGroup>
      )}

      <MoreGroup label="이메일">
        <MoreCardRow label="이메일">
          <MoreValue>{user.email ?? '(없음)'}</MoreValue>
        </MoreCardRow>
      </MoreGroup>

      <SocialAccountsGroup user={user} onDone={setToast} />

      <MoreCard className="py-0">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          disabled={deleteAccount.isPending}
          className="flex min-h-12 items-center text-14-regular text-snutt-red disabled:opacity-40"
        >
          계정삭제
        </button>
      </MoreCard>

      <PasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        onChanged={() => setToast('비밀번호를 바꿨습니다')}
      />
      {/* Figma `alert`: `정말 SNUTT 계정을 삭제하시겠습니까?` 취소 · 삭제. 지우면 토큰이 지워져 로그인 화면으로 간다 */}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        message={'정말 SNUTT 계정을\n삭제하시겠습니까?'}
        confirmLabel="삭제"
        onConfirm={() => deleteAccount.mutate()}
      />
      <NoticeDialog
        open={deleteAccount.isError}
        onOpenChange={(open) => !open && deleteAccount.reset()}
        message={deleteAccount.error && getFailureMessage(deleteAccount.error)}
      />
      <Toast open={toast !== null} onOpenChange={(open) => !open && setToast(null)} message={toast ?? ''} />
    </>
  );
}

/**
 * 닉네임 (Figma `더보기_내 계정` 두 번째 프레임): 연필을 누르면 카드 안에 입력칸과 취소 · 저장이 생긴다.
 * 태그(#1234)는 서버가 붙인다.
 */
function NicknameCard({ user, onSaved }: { user: User; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(user.nickname);
  const update = useUpdateNickname();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nickname = value.trim();
    if (!nickname) return;
    if (nickname === user.nickname) return setEditing(false);
    update.mutate(nickname, {
      onSuccess: () => {
        setEditing(false);
        onSaved();
      },
    });
  };

  if (!editing)
    return (
      <MoreCard>
        <MoreCardRow label="닉네임">
          <span className="flex min-w-0 items-center gap-1">
            <MoreValue>{formatNicknameWithTag(user)}</MoreValue>
            <IconButton
              label="닉네임 바꾸기"
              icon={<IconEdit className="size-4!" />}
              onClick={() => {
                setValue(user.nickname);
                update.reset();
                setEditing(true);
              }}
            />
          </span>
        </MoreCardRow>
      </MoreCard>
    );

  return (
    <MoreCard className="py-3.5">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <label htmlFor="more-nickname" className="text-14-regular text-plain">
          닉네임
        </label>
        <TextField
          id="more-nickname"
          // 입력칸을 여는 버튼을 눌러 연 것이라 바로 쓸 수 있게 한다
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={update.isError ? true : undefined}
          aria-describedby={update.isError ? 'more-nickname-error' : undefined}
        />
        {update.isError && (
          <p id="more-nickname-error" className="text-12-regular text-warning">
            {getFailureMessage(update.error)}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" className="w-16" onClick={() => setEditing(false)}>
            취소
          </Button>
          <Button type="submit" className="w-16" disabled={!value.trim() || update.isPending}>
            저장
          </Button>
        </div>
      </form>
    </MoreCard>
  );
}
