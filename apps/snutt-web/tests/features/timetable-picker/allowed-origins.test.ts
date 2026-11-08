import { describe, expect, it } from 'vitest';
import { isAllowedOrigin, parseAllowedOrigins } from '@/features/timetable-picker/allowed-origins';

describe('parseAllowedOrigins', () => {
  it('콤마로 구분된 origin 목록을 파싱한다', () => {
    expect(parseAllowedOrigins('https://a.com,https://b.com')).toEqual(['https://a.com', 'https://b.com']);
  });

  it('앞뒤 공백을 trim 한다', () => {
    expect(parseAllowedOrigins('  https://a.com , https://b.com  ')).toEqual(['https://a.com', 'https://b.com']);
  });

  it('빈 항목을 제거한다', () => {
    expect(parseAllowedOrigins('https://a.com,,https://b.com,')).toEqual(['https://a.com', 'https://b.com']);
  });

  it('빈 문자열이면 빈 배열을 반환한다', () => {
    expect(parseAllowedOrigins('')).toEqual([]);
  });
});

describe('isAllowedOrigin', () => {
  const origins = ['https://a.com', 'https://b.org'];

  it('허용 목록에 있는 origin 을 허용한다', () => {
    expect(isAllowedOrigin('https://a.com', origins)).toBe(true);
    expect(isAllowedOrigin('https://b.org', origins)).toBe(true);
  });

  it('null 은 거부한다', () => {
    expect(isAllowedOrigin(null, origins)).toBe(false);
  });

  it('허용 목록에 없는 origin 을 거부한다', () => {
    expect(isAllowedOrigin('https://c.com', origins)).toBe(false);
  });

  it('끝에 슬래시가 붙은 origin 을 거부한다 (정확히 일치)', () => {
    expect(isAllowedOrigin('https://a.com/', origins)).toBe(false);
  });

  it('서브도메인을 거부한다', () => {
    expect(isAllowedOrigin('https://evil.a.com', origins)).toBe(false);
  });

  it('a.com.evil.com 처럼 suffix 로 맞추는 것을 거부한다', () => {
    expect(isAllowedOrigin('https://a.com.evil.com', origins)).toBe(false);
  });

  it('대소문자가 다른 origin 을 거부한다', () => {
    expect(isAllowedOrigin('HTTPS://A.COM', origins)).toBe(false);
  });

  it('스킴이 다른 origin 을 거부한다 (http vs https)', () => {
    expect(isAllowedOrigin('http://a.com', origins)).toBe(false);
  });

  it('빈 허용 목록이면 모두 거부한다', () => {
    expect(isAllowedOrigin('https://a.com', [])).toBe(false);
  });
});
