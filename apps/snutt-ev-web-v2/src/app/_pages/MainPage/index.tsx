import { AppBar } from '@/app/_components/AppBar';

export const MainPage = async () => {
  return (
    <div>
      <AppBar left={<p>logo</p>} title={<AppBar.Title title="강의평" />} right={<p>search</p>} />
    </div>
  );
};
