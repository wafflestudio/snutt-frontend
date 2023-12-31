import Link from 'next/link';

import { AppBar } from '@/app/_components/AppBar';

export const MainPage = async () => {
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
    </div>
  );
};
