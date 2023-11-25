import { createDrawerNavigator, DrawerContentComponentProps, DrawerHeaderProps } from '@react-navigation/drawer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContext, Dispatch, useContext, useMemo, useReducer } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { CourseBook } from '../../../entities/courseBook';
import { FriendId } from '../../../entities/friend';
import { Nickname } from '../../../entities/user';
import { get } from '../../../utils/get';
import { AppBar } from '../../components/Appbar';
import { BottomSheet } from '../../components/BottomSheet';
import { HamburgerIcon } from '../../components/Icons/HamburgerIcon';
import { QuestionIcon } from '../../components/Icons/QuestionIcon';
import { UserPlusIcon } from '../../components/Icons/UserPlusIcon';
import { WarningIcon } from '../../components/Icons/WarningIcon';
import { Input } from '../../components/Input';
import { NotificationDot } from '../../components/NotificationDot';
import { Typography } from '../../components/Typography';
import { useServiceContext } from '../../contexts/ServiceContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useFriendCourseBooks } from '../../queries/useFriendCourseBooks';
import { useFriends } from '../../queries/useFriends';
import { COLORS } from '../../styles/colors';
import { FriendTimetable } from './FriendTimetable';
import { ManageFriendsDrawerContent } from './ManageFriendsDrawerContent';

type MainScreenState = {
  selectedFriendId: FriendId | undefined;
  selectedCourseBook: CourseBook | undefined;
  isAddFriendModalOpen: boolean;
  addFriendModalNickname: string;
  isGuideModalOpen: boolean;
};
type MainScreenAction =
  | { type: 'setFriend'; friendId: FriendId | undefined }
  | { type: 'setCourseBook'; courseBook: CourseBook }
  | { type: 'setAddFriendModalOpen'; isOpen: boolean }
  | { type: 'setAddFriendModalNickname'; nickname: string }
  | { type: 'setGuideModalOpen'; isOpen: boolean };
type MainScreenContext = MainScreenState & { dispatch: Dispatch<MainScreenAction> };
const mainScreenReducer = (state: MainScreenState, action: MainScreenAction): MainScreenState => {
  switch (action.type) {
    case 'setFriend':
      return { ...state, selectedFriendId: action.friendId, selectedCourseBook: undefined };
    case 'setCourseBook':
      return { ...state, selectedCourseBook: action.courseBook };
    case 'setAddFriendModalOpen':
      return action.isOpen
        ? { ...state, isAddFriendModalOpen: true }
        : { ...state, isAddFriendModalOpen: false, addFriendModalNickname: '' };
    case 'setAddFriendModalNickname':
      if (!state.isAddFriendModalOpen) throw new Error();
      return { ...state, addFriendModalNickname: action.nickname };
    case 'setGuideModalOpen':
      return { ...state, isGuideModalOpen: action.isOpen };
  }
};
const mainScreenContext = createContext<MainScreenContext | null>(null);
export const useMainScreenContext = () => {
  const context = useContext(mainScreenContext);
  if (context === null) throw new Error('MainScreenContext is not provided');
  return context;
};
const Drawer = createDrawerNavigator();

export const MainScreen = () => {
  const [state, dispatch] = useReducer(mainScreenReducer, {
    selectedFriendId: undefined,
    selectedCourseBook: undefined,
    isAddFriendModalOpen: false,
    addFriendModalNickname: '',
    isGuideModalOpen: false,
  });

  const backgroundColor = useThemeContext((data) => data.color.bg.default);
  const { data: friends } = useFriends({ state: 'ACTIVE' });
  const selectedFriendIdWithDefault = state.selectedFriendId ?? friends?.[0]?.friendId;
  const { data: courseBooks } = useFriendCourseBooks(selectedFriendIdWithDefault);
  const selectedCourseBookWithDefault = state.selectedCourseBook ?? courseBooks?.at(0);

  return (
    <mainScreenContext.Provider
      value={useMemo(
        () => ({
          selectedFriendId: selectedFriendIdWithDefault,
          selectedCourseBook: selectedCourseBookWithDefault,
          isAddFriendModalOpen: state.isAddFriendModalOpen,
          addFriendModalNickname: state.addFriendModalNickname,
          isGuideModalOpen: state.isGuideModalOpen,
          dispatch,
        }),
        [
          selectedFriendIdWithDefault,
          selectedCourseBookWithDefault,
          state.isAddFriendModalOpen,
          state.addFriendModalNickname,
          state.isGuideModalOpen,
        ],
      )}
    >
      <Drawer.Navigator
        screenOptions={{ header: Header, drawerType: 'front', drawerStyle: { backgroundColor, width: 320 } }}
        drawerContent={DrawerContent}
      >
        <Drawer.Screen name="Main" component={FriendTimetable} />
      </Drawer.Navigator>
    </mainScreenContext.Provider>
  );
};

const Header = ({ navigation }: DrawerHeaderProps) => {
  const { addFriendModalNickname, isAddFriendModalOpen, dispatch } = useMainScreenContext();
  const { friendService } = useServiceContext();
  const { mutate: request } = useRequestFriend();
  const guideEnabledColor = useThemeContext((data) => data.color.text.guide);
  const { data: requestedFriends } = useFriends({ state: 'REQUESTED' });

  const isRequestedFriendExist = requestedFriends && requestedFriends.length !== 0;
  const isValid = friendService.isValidNicknameTag(addFriendModalNickname);
  const guideMessageState = addFriendModalNickname === '' ? 'disabled' : isValid ? 'hidden' : 'enabled';

  const openAddFriendModal = () => dispatch({ type: 'setAddFriendModalOpen', isOpen: true });
  const closeAddFriendModal = () => dispatch({ type: 'setAddFriendModalOpen', isOpen: false });
  const openGuideModal = () => dispatch({ type: 'setGuideModalOpen', isOpen: true });

  return (
    <>
      <AppBar
        title={
          <TouchableOpacity onPress={openGuideModal} style={styles.questionIconButton}>
            <AppBar.Title>친구 시간표</AppBar.Title>

            <QuestionIcon style={styles.questionIcon} width={16} height={16} />
          </TouchableOpacity>
        }
        left={
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <View style={styles.hamburgerWrapper}>
              <HamburgerIcon width={30} height={30} />
              {isRequestedFriendExist && <NotificationDot style={styles.hamburgerNotificationDot} />}
            </View>
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity onPress={openAddFriendModal}>
            <UserPlusIcon width={22} height={22} />
          </TouchableOpacity>
        }
      />
      <BottomSheet isOpen={isAddFriendModalOpen} onClose={closeAddFriendModal}>
        <View style={styles.modalContent}>
          <BottomSheet.Header
            left={{ text: '취소', onPress: closeAddFriendModal }}
            right={{
              text: '요청 보내기',
              onPress: () =>
                request(addFriendModalNickname, {
                  onSuccess: () => {
                    Alert.alert('친구에게 요청을 보냈습니다.');
                    closeAddFriendModal();
                  },
                  onError: (err) => {
                    const displayMessage = get(err, ['displayMessage']);
                    Alert.alert(displayMessage ? `${displayMessage}` : '오류가 발생했습니다.');
                  },
                }),
              disabled: !isValid,
            }}
          />
          <Typography variant="description" style={styles.inputDescription}>
            추가하고 싶은 친구의 닉네임
          </Typography>
          <Input
            style={styles.input}
            autoFocus
            value={addFriendModalNickname}
            onChange={(e) => dispatch({ type: 'setAddFriendModalNickname', nickname: e })}
            placeholder="예) 홍길동#1234"
          />
          <View style={styles.guide}>
            {guideMessageState !== 'hidden' &&
              (() => {
                const color = { enabled: guideEnabledColor, disabled: COLORS.gray40 }[guideMessageState];
                return (
                  <>
                    <WarningIcon width={18} height={18} style={{ color }} />
                    <Typography variant="description" style={{ ...styles.guideText, color }}>
                      닉네임 전체를 입력하세요
                    </Typography>
                  </>
                );
              })()}
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

const DrawerContent = ({ navigation }: DrawerContentComponentProps) => {
  return <ManageFriendsDrawerContent onClose={() => navigation.closeDrawer()} />;
};

const useRequestFriend = () => {
  const { friendService } = useServiceContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nickname: Nickname) => friendService.requestFriend({ nickname }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

const styles = StyleSheet.create({
  questionIconButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  questionIcon: { color: COLORS.gray30 },
  modalContent: { paddingBottom: 30 },
  inputDescription: { marginTop: 30, fontSize: 14 },
  input: { marginTop: 15 },
  guide: {
    marginTop: 7,
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
    height: 12,
  },
  guideText: { fontSize: 12 },
  hamburgerWrapper: { position: 'relative' },
  hamburgerNotificationDot: { position: 'absolute', top: 5, right: -1 },
});
