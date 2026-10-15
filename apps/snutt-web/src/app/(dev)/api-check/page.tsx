import { notFound } from 'next/navigation';
import { ApiCheck } from './_components/ApiCheck';

/** dev 서버 API 연결 확인용 개발 페이지. 프로덕션에서는 404 */
export default function ApiCheckPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <ApiCheck />;
}
