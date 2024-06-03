import { Layout } from '@/components/layout';
import { Loader } from '@/components/loader';

export const LoadingPage = () => {
  return (
    <Layout>
      <div style={{ width: 40, height: 40, margin: '300px auto' }}>
        <Loader />
      </div>
    </Layout>
  );
};
