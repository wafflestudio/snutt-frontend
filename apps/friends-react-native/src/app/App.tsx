import 'react-native-gesture-handler';

import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useThemeContext } from './contexts/ThemeContext';
import { MainScreen } from './screens/MainScreen';

const queryClient = new QueryClient();

export const App = ({ eventStr }: { eventStr: string }) => {
  const background = useThemeContext().color.bg.default;

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer
        theme={useMemo(() => ({ ...DefaultTheme, colors: { ...DefaultTheme.colors, background } }), [background])}
      >
        <MainScreen eventStr={eventStr} />
      </NavigationContainer>
    </QueryClientProvider>
  );
};
