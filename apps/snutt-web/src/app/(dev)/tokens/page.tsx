import { notFound } from 'next/navigation';
import { TokenPreview } from './_components/TokenPreview';

/** 디자인 토큰 확인용 개발 페이지. 프로덕션에서는 404 */
export default function TokensPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <TokenPreview />;
}
