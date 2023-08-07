import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainScreen } from './screens/MainScreen';
import { NavigationContainer } from '@react-navigation/native';

import 'react-native-gesture-handler';

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <MainScreen />
      </NavigationContainer>
    </QueryClientProvider>
  );
};
