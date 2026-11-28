/**
 * 네이버 지도 JS SDK(v3, NCP Maps 의 Dynamic Map)를 불러온다. 강의 상세의 지도에서 쓴다.
 * Client ID 는 공개 값이라 빌드할 때 번들에 넣는다(`NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`). NCP 콘솔의 Web 서비스 URL 에
 * 이 사이트 주소(`http://localhost:3000`, 배포 도메인)가 있어야 인증된다.
 * 쿼리 이름은 NCP 서비스 개편으로 `ncpClientId` 에서 `ncpKeyId` 로 바뀌었다.
 */

/** 쓰는 것만 적은 SDK 타입 */
export type NaverMaps = {
  LatLng: new (latitude: number, longitude: number) => NaverLatLng;
  LatLngBounds: new (southWest: NaverLatLng, northEast: NaverLatLng) => unknown;
  Point: new (x: number, y: number) => unknown;
  Map: new (element: HTMLElement, options: Record<string, unknown>) => NaverMap;
  Marker: new (options: Record<string, unknown>) => { setMap: (map: NaverMap | null) => void };
};
export type NaverLatLng = object;
export type NaverMap = {
  fitBounds: (bounds: unknown, margin?: { top: number; right: number; bottom: number; left: number }) => void;
  destroy: () => void;
};

type NaverWindow = Window & { naver?: { maps?: NaverMaps }; navermap_authFailure?: () => void };

const getClientId = () => process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? '';

/** Client ID 가 있어 지도를 쓸 수 있는지. 없으면 지도 버튼을 보여 주지 않는다 */
export const isNaverMapAvailable = () => getClientId() !== '';

let loading: Promise<NaverMaps> | null = null;
const authFailureListeners = new Set<() => void>();

/**
 * SDK 를 한 번만 불러온다. 스크립트를 받지 못하면 실패하고 다음에 다시 시도한다.
 * 인증 실패(등록하지 않은 주소, 잘못된 ID)는 스크립트를 받은 뒤 따로 알려 와서 onAuthFailure 로 받는다
 */
export const loadNaverMaps = () => {
  loading ??= new Promise<NaverMaps>((resolve, reject) => {
    const win = window as NaverWindow;
    win.navermap_authFailure = () => authFailureListeners.forEach((listener) => listener());
    if (win.naver?.maps) return resolve(win.naver.maps);

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(getClientId())}`;
    script.async = true;
    script.onload = () => (win.naver?.maps ? resolve(win.naver.maps) : reject(new Error('네이버 지도를 불러오지 못했습니다')));
    script.onerror = () => {
      script.remove();
      reject(new Error('네이버 지도를 불러오지 못했습니다'));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    loading = null;
    throw error;
  });
  return loading;
};

/** 인증 실패를 듣는다. 돌려준 함수로 그만 듣는다 */
export const onNaverMapAuthFailure = (listener: () => void) => {
  authFailureListeners.add(listener);
  return () => {
    authFailureListeners.delete(listener);
  };
};
