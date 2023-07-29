import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainScreen } from './screens/MainScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import 'react-native-gesture-handler';

const queryClient = new QueryClient();
const Drawer = createDrawerNavigator();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Drawer.Navigator>
          <Drawer.Screen name="Main" component={MainScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
};
