import { FriendTimetable } from './FriendTimetable';

import { DrawerContentComponentProps, DrawerHeaderProps, createDrawerNavigator } from '@react-navigation/drawer';
import { AppBar } from '../../components/Appbar';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ManageFriendsDrawerContent } from './ManageFriendsDrawerContent';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServiceContext } from '../../../main';
import { createContext, useContext, useMemo, useState } from 'react';
import { Nickname } from '../../../entities/user';
import { FriendId } from '../../../entities/friend';
import { useFriends } from '../../queries/useFriends';
import { HamburgerIcon } from '../../components/Icons/HamburgerIcon';
import { UserPlusIcon } from '../../components/Icons/UserPlusIcon';
import { WarningIcon } from '../../components/Icons/WarningIcon';
import { Input } from '../../components/Input';
import { BottomSheet } from '../../components/BottomSheet';

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
  const { friendService } = useServiceContext();
  const { mutate: request } = useRequestFriend();

  const guideMessageState =
    friendName === '' ? 'disabled' : friendService.isValidNicknameTag(friendName) ? 'hidden' : 'enabled';

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
            <HamburgerIcon width={30} height={30} />
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity onPress={openModal}>
            <UserPlusIcon width={22} height={22} />
          </TouchableOpacity>
        }
      />
      <BottomSheet isOpen={isModalOpen} onClose={closeModal}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalHeaderText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!friendService.isValidNicknameTag(friendName)}
              onPress={() => request(friendName, { onSuccess: closeModal })}
            >
              <Text
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  ...styles.modalHeaderText,
                  color: friendService.isValidNicknameTag(friendName) ? undefined : '#c4c4c4',
                }}
              >
                요청 보내기
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inputDescription}>추가하고 싶은 친구의 닉네임</Text>
          <Input
            style={styles.input}
            value={friendName}
            onChange={(e) => setFriendName(e)}
            placeholder="예) 홍길동#1234"
          />
          {guideMessageState !== 'hidden' &&
            (() => {
              const color = { enabled: '#00b8b0', disabled: '#777777' }[guideMessageState];
              return (
                <View style={styles.guide}>
                  <WarningIcon width={18} height={18} style={{ color }} />
                  <Text style={{ ...styles.guideText, color }}>닉네임 전체를 입력하세요</Text>
                </View>
              );
            })()}
        </View>
      </BottomSheet>
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
  modalContent: { paddingBottom: 30 },
  modalHeader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalHeaderText: { fontSize: 14, color: '#0e0e0e' },
  inputDescription: { marginTop: 30, color: '#777', fontSize: 14 },
  input: { marginTop: 15 },
  guide: {
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
  },
  guideText: { color: '#00b8b0', fontSize: 10 },
});
