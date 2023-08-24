import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useThemeContext } from './contexts/ThemeContext';
import { MainScreen } from './screens/MainScreen';

const queryClient = new QueryClient();

export const App = () => {
  const backgroundColor = useThemeContext((data) => data.color.bg.default);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider style={[styles.container, { backgroundColor }]}>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <MainScreen />
          </SafeAreaView>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
