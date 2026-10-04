import { notFound } from 'next/navigation';
import { GridPreview } from './_components/GridPreview';

/** 시간표 그리드 확인용 개발 페이지. 프로덕션에서는 404 */
export default function GridPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <GridPreview />;
}
