/** 로그인 화면 주소. 로그인하면 next 로 돌아간다 */
export const getLoginPath = (next: string) => (next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`);

/**
 * 로그인 뒤 돌아갈 곳. 이 사이트 안의 경로만 받는다 (`//다른사이트` 나 `https://…` 로 보내지 않는다)
 * `?next=/friends` → '/friends', 없거나 잘못되면 '/'
 */
export const getNextPath = (search: string) => {
  const next = new URLSearchParams(search).get('next');
  return next?.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/';
};
