/**
 * 소셜 로그인 · 연동에 쓸 provider access token 을 받는다. 서버(`POST /v2/auth/login/{provider}`,
 * `POST /v2/users/me/social/{provider}`)는 provider 가 준 access token 을 받아 그 계정을 확인한다.
 *
 * - 구글 · 페이스북: SDK 팝업에서 바로 access token 을 받는다.
 * - 카카오: 새 JS SDK(v2)는 팝업 로그인이 없고(예전 SDK 는 2026-12-31 지원 종료) 리다이렉트로 인가 코드만 준다.
 *   카카오 로그인 화면으로 이동했다가 `/oauth/kakao` 로 돌아오면, 거기서 REST API 키로 코드를 토큰으로 바꾼다.
 *   서버가 코드를 받지 않아 브라우저에서 바꾼다(2026-11-28 결정. 개발 플랜 3-2).
 *
 * 앱 키는 공개 값이라 빌드할 때 번들에 넣는다 (`NEXT_PUBLIC_*`).
 */

export type SocialLoginProvider = 'kakao' | 'google' | 'facebook';

/** 웹에서 로그인 · 연동할 수 있는 provider 와 버튼 순서. 애플은 웹 로그인을 붙이지 않았다 */
export const SOCIAL_LOGIN_PROVIDERS: readonly SocialLoginProvider[] = ['kakao', 'google', 'facebook'];

export const isSocialLoginProvider = (provider: string): provider is SocialLoginProvider =>
  (SOCIAL_LOGIN_PROVIDERS as readonly string[]).includes(provider);

/** 사용자에게 보여 줄 실패 이유가 있는 오류 */
export class SocialAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SocialAuthError';
  }
}

/** 사용자가 팝업을 닫거나 취소했다. 알리지 않는다 */
export class SocialAuthCancelled extends Error {
  constructor() {
    super('취소했습니다');
    this.name = 'SocialAuthCancelled';
  }
}

// 빌드할 때 글자 그대로 바뀐다. 테스트에서 vi.stubEnv 로 바꿀 수 있게 쓸 때 읽는다
const getGoogleClientId = () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const getFacebookAppId = () => process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? '';
const getKakaoRestApiKey = () => process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ?? '';

const NOT_CONFIGURED = '이 환경에서는 사용할 수 없는 로그인 방법입니다';

// ── 스크립트 ──────────────────────────────────────────────────────────────────

const scripts = new Map<string, Promise<void>>();

/** SDK 스크립트를 한 번만 넣는다. 실패하면 다음에 다시 시도할 수 있게 지운다 */
const loadScript = (src: string) => {
  const loaded =
    scripts.get(src) ??
    new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scripts.delete(src);
        script.remove();
        reject(new SocialAuthError('로그인 도구를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요'));
      };
      document.head.appendChild(script);
    });
  scripts.set(src, loaded);
  return loaded;
};

// ── 구글 (Google Identity Services 의 token client) ──────────────────────────

type GoogleTokenResponse = { access_token?: string; error?: string; error_description?: string };
type GoogleTokenClient = { requestAccessToken: () => void };
type GoogleAccounts = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: GoogleTokenResponse) => void;
      error_callback?: (error: { type: string }) => void;
    }) => GoogleTokenClient;
  };
};

const getGoogleAccessToken = async () => {
  const clientId = getGoogleClientId();
  if (!clientId) throw new SocialAuthError(NOT_CONFIGURED);
  await loadScript('https://accounts.google.com/gsi/client');
  const accounts = (window as unknown as { google?: { accounts: GoogleAccounts } }).google?.accounts;
  if (!accounts) throw new SocialAuthError('구글 로그인을 시작하지 못했습니다');

  return new Promise<string>((resolve, reject) => {
    accounts.oauth2
      .initTokenClient({
        client_id: clientId,
        // snutt-webclient(@react-oauth/google)와 같은 범위
        scope: 'openid profile email',
        callback: (response) => {
          if (response.access_token) resolve(response.access_token);
          else reject(new SocialAuthError(response.error_description ?? '구글 로그인에 실패했습니다'));
        },
        // 팝업을 닫거나 막혔을 때
        error_callback: (error) =>
          reject(
            error.type === 'popup_failed_to_open'
              ? new SocialAuthError('팝업이 막혀 있습니다. 브라우저에서 팝업을 허용해 주세요')
              : new SocialAuthCancelled(),
          ),
      })
      .requestAccessToken();
  });
};

// ── 페이스북 (JS SDK) ─────────────────────────────────────────────────────────

type FacebookLoginResponse = { status: string; authResponse?: { accessToken: string } | null };
type FacebookSdk = {
  init: (options: { appId: string; version: string; cookie?: boolean; xfbml?: boolean }) => void;
  login: (callback: (response: FacebookLoginResponse) => void, options?: { scope: string }) => void;
};

let facebookReady: Promise<FacebookSdk> | null = null;

const loadFacebook = () => {
  facebookReady ??= loadScript('https://connect.facebook.net/ko_KR/sdk.js')
    .then(() => {
      const sdk = (window as unknown as { FB?: FacebookSdk }).FB;
      if (!sdk) throw new SocialAuthError('페이스북 로그인을 시작하지 못했습니다');
      sdk.init({ appId: getFacebookAppId(), version: 'v21.0' });
      return sdk;
    })
    .catch((error: unknown) => {
      facebookReady = null;
      throw error;
    });
  return facebookReady;
};

const getFacebookAccessToken = async () => {
  if (!getFacebookAppId()) throw new SocialAuthError(NOT_CONFIGURED);
  const sdk = await loadFacebook();
  return new Promise<string>((resolve, reject) => {
    // snutt-webclient(react-facebook-login)와 같은 범위
    sdk.login(
      (response) => {
        if (response.authResponse?.accessToken) resolve(response.authResponse.accessToken);
        else reject(new SocialAuthCancelled());
      },
      { scope: 'public_profile,email' },
    );
  });
};

/** 팝업으로 구글 · 페이스북 access token 을 받는다. 사용자가 팝업을 닫으면 SocialAuthCancelled */
export const getPopupAccessToken = (provider: 'google' | 'facebook') =>
  provider === 'google' ? getGoogleAccessToken() : getFacebookAccessToken();

// ── 카카오 (리다이렉트) ───────────────────────────────────────────────────────

/** 카카오에서 돌아온 뒤 할 일. 로그인이면 next 로, 연동이면 시작한 화면(next)으로 돌아간다 */
export type KakaoAuthPurpose = 'login' | 'link';
export type KakaoAuthRequest = { purpose: KakaoAuthPurpose; next: string };

/** 카카오 콘솔에 등록한 Redirect URI 와 글자 하나까지 같아야 한다 */
export const KAKAO_REDIRECT_PATH = '/oauth/kakao';
const KAKAO_STATE_KEY = 'snutt-web:kakao-auth';

const getKakaoRedirectUri = () => `${window.location.origin}${KAKAO_REDIRECT_PATH}`;

/**
 * 카카오 로그인 화면으로 이동한다. 돌아올 때 다른 사이트가 보낸 요청이 아닌지 확인하려고
 * 임의의 state 를 이 탭(sessionStorage)에 함께 둔다.
 */
export const startKakaoAuth = (request: KakaoAuthRequest) => {
  if (!getKakaoRestApiKey()) throw new SocialAuthError(NOT_CONFIGURED);
  const state = crypto.randomUUID();
  try {
    window.sessionStorage.setItem(KAKAO_STATE_KEY, JSON.stringify({ state, ...request }));
  } catch {
    throw new SocialAuthError('브라우저 저장소를 쓸 수 없어 카카오 로그인을 시작하지 못했습니다');
  }
  window.location.assign(getKakaoAuthorizeUrl(state));
};

/** 카카오 로그인 화면 주소 */
export const getKakaoAuthorizeUrl = (state: string) =>
  `https://kauth.kakao.com/oauth/authorize?${new URLSearchParams({
    client_id: getKakaoRestApiKey(),
    redirect_uri: getKakaoRedirectUri(),
    response_type: 'code',
    state,
  })}`;

/** `/oauth/kakao` 에서 시작할 때 저장한 요청을 꺼낸다(한 번만). state 가 다르면 null */
export const takeKakaoAuthRequest = (state: string | null): KakaoAuthRequest | null => {
  let saved: unknown = null;
  try {
    saved = JSON.parse(window.sessionStorage.getItem(KAKAO_STATE_KEY) ?? 'null');
    window.sessionStorage.removeItem(KAKAO_STATE_KEY);
  } catch {
    return null;
  }
  if (!saved || typeof saved !== 'object') return null;
  const { state: savedState, purpose, next } = saved as Record<string, unknown>;
  if (!state || savedState !== state) return null;
  if ((purpose !== 'login' && purpose !== 'link') || typeof next !== 'string') return null;
  return { purpose, next };
};

/** 카카오가 돌려준 인가 코드를 access token 으로 바꾼다 */
export const exchangeKakaoCode = async (code: string) => {
  const clientId = getKakaoRestApiKey();
  if (!clientId) throw new SocialAuthError(NOT_CONFIGURED);
  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: getKakaoRedirectUri(),
      code,
    }),
  }).catch(() => {
    throw new SocialAuthError('카카오에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요');
  });
  const data = (await response.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!response.ok || !data.access_token)
    throw new SocialAuthError(`카카오 로그인에 실패했습니다${data.error_description ? ` (${data.error_description})` : ''}`);
  return data.access_token;
};
