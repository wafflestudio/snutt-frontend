import { FriendTimetable } from './FriendTimetable';

import { DrawerContentComponentProps, DrawerHeaderProps, createDrawerNavigator } from '@react-navigation/drawer';
import { AppBar } from '../../components/Appbar';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Alert, Text } from 'react-native';
import { ManageFriendsDrawerContent } from './ManageFriendsDrawerContent';
const Drawer = createDrawerNavigator();

export const MainScreen = () => {
  return (
    <Drawer.Navigator screenOptions={{ header: Header }} drawerContent={DrawerContent}>
      <Drawer.Screen name="Main" component={FriendTimetable} />
    </Drawer.Navigator>
  );
};

const Header = ({ navigation }: DrawerHeaderProps) => (
  <AppBar
    title="친구 시간표"
    left={
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Text>=</Text>
      </TouchableOpacity>
    }
    right={
      <TouchableOpacity onPress={() => Alert.alert('not implemented')}>
        <Text>+</Text>
      </TouchableOpacity>
    }
  />
);

const DrawerContent = ({ navigation }: DrawerContentComponentProps) => {
  return <ManageFriendsDrawerContent onClose={() => navigation.closeDrawer()} />;
};
