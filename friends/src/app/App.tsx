import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainScreen } from './screens/MainScreen';

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MainScreen />
    </QueryClientProvider>
  );
};
