import Link from 'next/link';

import { Text } from '@/app/_components/Text';

export const MainPageRecentSection = ({ lectures }: { lectures: unknown[] }) => {
  return (
    <section>
      <div>
        <Text>지난 학기 강의평을 남겨주세요</Text>
        <Link href="/recent" data-testid="main-recent-more-link">
          <Text>강의 목록 {'>'}</Text>
        </Link>
      </div>
      <div>{JSON.stringify(lectures)}</div>
    </section>
  );
};
