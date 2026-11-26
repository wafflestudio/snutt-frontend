// 더보기 목록의 바깥 링크. snutt-webclient 의 바닥글과 같은 서버 페이지다
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export const TERMS_OF_SERVICE_URL = `${API_BASE_URL}/terms_of_service`;
export const PRIVACY_POLICY_URL = `${API_BASE_URL}/privacy_policy`;
