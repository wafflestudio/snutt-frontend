/**
 * timetable-picker 허용 출처 관리.
 * 환경 변수 NEXT_PUBLIC_TIMETABLE_PICKER_ORIGINS 에 콤마로 구분한 origin 목록을 넣는다.
 * 예: https://app.example.com,https://dev.example.com
 *
 * 허용 검사는 정확히 일치만 (레거시 snutt-webclient 계약 유지):
 *   origin !== null && allowedOrigins.includes(origin)
 */

/** 콤마 구분 문자열을 trim 하고 빈 값을 제거해 목록으로 만든다 */
export const parseAllowedOrigins = (raw: string): readonly string[] =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * 빌드 시 주입된 허용 목록.
 * 배포 워크플로의 TIMETABLE_PICKER_ORIGINS 시크릿 → NEXT_PUBLIC_TIMETABLE_PICKER_ORIGINS 환경 변수로 넣는다.
 */
export const PICKER_ALLOWED_ORIGINS: readonly string[] = parseAllowedOrigins(
  process.env.NEXT_PUBLIC_TIMETABLE_PICKER_ORIGINS ?? '',
);

/**
 * origin 이 허용 목록에 있는지 확인한다.
 * null 이면 항상 거부. 대소문자 구별, 경로 없이 출처(scheme + host + port)만 비교한다.
 */
export const isAllowedOrigin = (
  origin: string | null,
  allowedOrigins: readonly string[] = PICKER_ALLOWED_ORIGINS,
): origin is string => origin !== null && allowedOrigins.includes(origin);
