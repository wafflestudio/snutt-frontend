import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 화면은 모두 클라이언트에서 그린다(토큰이 브라우저에 있다). out/ 의 정적 파일을 S3 · CloudFront 로 배포한다 (scripts/deploy-s3.sh)
  output: 'export',
  // @sf/snutt-api 는 빌드 없이 TS 소스를 그대로 export 하므로 트랜스파일 대상에 포함
  transpilePackages: ['@sf/snutt-api'],
  // 개발 도구 버튼이 기본 위치(왼쪽 아래)에서 좌측 바의 테마 버튼을 가린다
  devIndicators: { position: 'bottom-right' },
};

export default nextConfig;
