import { FriendTimetable } from './FriendTimetable';

import { DrawerContentComponentProps, DrawerHeaderProps, createDrawerNavigator } from '@react-navigation/drawer';
import { AppBar } from '../../components/Appbar';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Modal, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ManageFriendsDrawerContent } from './ManageFriendsDrawerContent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServiceContext } from '../../../main';
import { createContext, useContext, useMemo, useState } from 'react';
import { Nickname } from '../../../entities/user';
import { FriendId } from '../../../entities/friend';
import { useFriends } from '../../queries/useFriends';

type MainScreenContext = {
  selectedFriendId: FriendId | undefined;
  onSelectFriend: (friendId: FriendId | undefined) => void;
};
const mainScreenContext = createContext<MainScreenContext | null>(null);
export const useMainScreenContext = () => {
  const context = useContext(mainScreenContext);
  if (context === null) throw new Error('MainScreenContext is not provided');
  return context;
};
const Drawer = createDrawerNavigator();

export const MainScreen = () => {
  const [selectedFriendId, setSelectedFriendId] = useState<FriendId>();

  const { data: friends } = useFriends({ state: 'ACTIVE' });
  const selectedFriendIdWithDefault = selectedFriendId ?? friends?.[0]?.friendId;

  return (
    <mainScreenContext.Provider
      value={useMemo(
        () => ({ selectedFriendId: selectedFriendIdWithDefault, onSelectFriend: setSelectedFriendId }),
        [selectedFriendIdWithDefault],
      )}
    >
      <Drawer.Navigator screenOptions={{ header: Header }} drawerContent={DrawerContent}>
        <Drawer.Screen name="Main" component={FriendTimetable} />
      </Drawer.Navigator>
    </mainScreenContext.Provider>
  );
};

const Header = ({ navigation }: DrawerHeaderProps) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [friendName, setFriendName] = useState('');

  const { mutate: request } = useRequestFriend();

  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false);
    setFriendName('');
  };

  return (
    <SafeAreaView>
      <AppBar
        title="친구 시간표"
        left={
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Text>=</Text>
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity onPress={openModal}>
            <Text>+</Text>
          </TouchableOpacity>
        }
      />
      <Modal visible={isModalOpen} animationType="slide" transparent={true} onRequestClose={closeModal}>
        <View style={styles.addFriendModal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal}>
                <Text>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => request(friendName, { onSuccess: closeModal })}>
                <Text>요청 보내기</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} value={friendName} onChange={(e) => setFriendName(e.nativeEvent.text)} />
            <Text>i 닉네임 전체를 입력하세요</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const DrawerContent = ({ navigation }: DrawerContentComponentProps) => {
  return <ManageFriendsDrawerContent onClose={() => navigation.closeDrawer()} />;
};

const useRequestFriend = () => {
  const { friendService } = useServiceContext();
  const queryClient = useQueryClient();

  return useMutation((nickname: Nickname) => friendService.requestFriend({ nickname }), {
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

const styles = StyleSheet.create({
  addFriendModal: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    height: 180,
    backgroundColor: 'white',
    padding: 20,
  },
  modalHeader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderBottomWidth: 1,
  },
});
