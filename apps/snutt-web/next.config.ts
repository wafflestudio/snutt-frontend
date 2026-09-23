import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // @sf/snutt-api 는 빌드 없이 TS 소스를 그대로 export 하므로 트랜스파일 대상에 포함
  transpilePackages: ['@sf/snutt-api'],
};

export default nextConfig;
