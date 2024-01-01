import Link from 'next/link';

import { AppBar } from '@/app/_components/AppBar';
import { MainPageRecentSection } from '@/app/_pages/MainPage/MainPageRecentSection';
import { getServerServices } from '@/app/utils/getServerServices';

export const MainPage = async () => {
  const { lectureService } = getServerServices();

  const { content: recentLectures } = await lectureService.getRecentSectionLectures();

  return (
    <div>
      <AppBar
        left={<p>logo</p>}
        title={<AppBar.Title title="강의평" />}
        right={
          <Link data-testid="main-search-icon" href={'/search'}>
            search
          </Link>
        }
      />
      <MainPageRecentSection lectures={recentLectures} />
    </div>
  );
};
