import { notFound } from 'next/navigation';
import { UiGallery } from './_components/UiGallery';

/** 기본 컴포넌트 확인용 개발 페이지. 프로덕션에서는 404 */
export default function UiPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <UiGallery />;
}
