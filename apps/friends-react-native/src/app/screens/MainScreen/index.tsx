import { createDrawerNavigator, DrawerContentComponentProps, DrawerHeaderProps } from '@react-navigation/drawer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContext, Dispatch, useContext, useEffect, useMemo, useReducer } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { CourseBook } from '../../../entities/courseBook';
import { ClientFeature } from '../../../entities/feature';
import { FriendId } from '../../../entities/friend';
import { Nickname } from '../../../entities/user';
import { AppBar } from '../../components/Appbar';
import { HamburgerIcon } from '../../components/Icons/HamburgerIcon';
import { QuestionIcon } from '../../components/Icons/QuestionIcon';
import { UserPlusIcon } from '../../components/Icons/UserPlusIcon';
import { NotificationDot } from '../../components/NotificationDot';
import { useFeatureContext } from '../../contexts/FeatureContext';
import { useServiceContext } from '../../contexts/ServiceContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useFriendCourseBooks } from '../../queries/useFriendCourseBooks';
import { useAcceptFriend, useFriends } from '../../queries/useFriends';
import { COLORS } from '../../styles/colors';
import { FriendTimetable } from './FriendTimetable';
import { ManageFriendsDrawerContent } from './ManageFriendsDrawerContent';
import { RequestFriendsBottomSheetContent } from './RequestFriendsBottomSheetContent';
import { AcceptFriendWithKakaoResponse } from '../../../repositories/responses/Friend';
import { get } from '../../../utils/get';

export type RequestFriendModalStep = 'METHOD_LIST' | 'REQUEST_WITH_NICKNAME';

type MainScreenState = {
  selectedFriendId: FriendId | undefined;
  selectedCourseBook: CourseBook | undefined;
  isRequestFriendModalOpen: boolean;
  requestFriendModalStep: RequestFriendModalStep;
  requestFriendModalNickname: string;
  isGuideModalOpen: boolean;
};
type MainScreenAction =
  | { type: 'setFriend'; friendId: FriendId | undefined }
  | { type: 'setCourseBook'; courseBook: CourseBook }
  | { type: 'setRequestFriendModalOpen'; isOpen: boolean }
  | { type: 'setRequestFriendModalStep'; requestFriendModalStep: RequestFriendModalStep }
  | { type: 'setRequestFriendModalNickname'; nickname: string }
  | { type: 'setGuideModalOpen'; isOpen: boolean };
type MainScreenContext = MainScreenState & { dispatch: Dispatch<MainScreenAction> };
const mainScreenReducer = (state: MainScreenState, action: MainScreenAction): MainScreenState => {
  switch (action.type) {
    case 'setFriend':
      return { ...state, selectedFriendId: action.friendId, selectedCourseBook: undefined };
    case 'setCourseBook':
      return { ...state, selectedCourseBook: action.courseBook };
    case 'setRequestFriendModalOpen':
      return action.isOpen
        ? { ...state, isRequestFriendModalOpen: true }
        : {
            ...state,
            isRequestFriendModalOpen: false,
            requestFriendModalNickname: '',
            requestFriendModalStep: 'METHOD_LIST',
          };
    case 'setRequestFriendModalNickname':
      if (!state.isRequestFriendModalOpen) throw new Error();
      return { ...state, requestFriendModalNickname: action.nickname };
    case 'setGuideModalOpen':
      return { ...state, isGuideModalOpen: action.isOpen };
    case 'setRequestFriendModalStep':
      return { ...state, requestFriendModalStep: action.requestFriendModalStep };
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
    isRequestFriendModalOpen: false,
    requestFriendModalStep: 'METHOD_LIST',
    requestFriendModalNickname: '',
    isGuideModalOpen: false,
  });

  const { nativeEventService } = useServiceContext();
  const { clientFeatures } = useFeatureContext();

  const { data: friends } = useFriends({ state: 'ACTIVE' });
  const { mutate: acceptFriend } = useAcceptFriend();

  const eventEmitter = nativeEventService.getEventEmitter();

  useEffect(() => {
    if (!clientFeatures.includes(ClientFeature.ASYNC_STORAGE)) return;

    import('@react-native-async-storage/async-storage')
      .then((storage) => {
        if (state.selectedFriendId) storage.default.setItem('selectedFriendId', state.selectedFriendId);
        else {
          storage.default.getItem('selectedFriendId').then((item) => {
            if (!friends) return;
            const selectedFriend = friends.find((f) => f.friendId === item);
            if (selectedFriend) dispatch({ type: 'setFriend', friendId: selectedFriend.friendId });
          });
        }
      })
      .catch(() => null);
  }, [state.selectedFriendId, clientFeatures, friends]);

  useEffect(() => {
    const parameters = { eventType: 'add-friend-kakao' };

    const listener = eventEmitter.addListener('add-friend-kakao', (event) => {
      if (!event.requestToken) return;

      acceptFriend(
        {
          type: 'KAKAO',
          requestToken: event.requestToken,
        },
        {
          onSuccess: (data) => {
            const response = data as AcceptFriendWithKakaoResponse;
            const nickname = response.nickname;
            Alert.alert(`${nickname.nickname}#${nickname.tag}님과\n친구가 되었습니다.`);

            dispatch({ type: 'setFriend', friendId: response.id });
          },
          onError: (err) => {
            const message = get(err, ['displayMessage']);
            Alert.alert(message ? `${message}` : '친구 추가를 실패했습니다.\n잠시 후, 다시 시도해 주세요.');
          },
        },
      );
    });

    nativeEventService.sendEventToNative({
      type: 'register',
      parameters,
    });

    return () => {
      listener.remove();

      nativeEventService.sendEventToNative({
        type: 'deregister',
        parameters,
      });
    };
  }, [eventEmitter, nativeEventService, acceptFriend]);

  const backgroundColor = useThemeContext((data) => data.color.bg.default);
  const selectedFriendIdWithDefault = state.selectedFriendId ?? friends?.at(0)?.friendId;
  const { data: courseBooks } = useFriendCourseBooks(selectedFriendIdWithDefault);
  const selectedCourseBookWithDefault = state.selectedCourseBook ?? courseBooks?.at(0);

  return (
    <mainScreenContext.Provider
      value={useMemo(
        () => ({
          selectedFriendId: selectedFriendIdWithDefault,
          selectedCourseBook: selectedCourseBookWithDefault,
          isRequestFriendModalOpen: state.isRequestFriendModalOpen,
          requestFriendModalStep: state.requestFriendModalStep,
          requestFriendModalNickname: state.requestFriendModalNickname,
          isGuideModalOpen: state.isGuideModalOpen,
          dispatch,
        }),
        [
          selectedFriendIdWithDefault,
          selectedCourseBookWithDefault,
          state.isRequestFriendModalOpen,
          state.requestFriendModalStep,
          state.requestFriendModalNickname,
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
  const { dispatch } = useMainScreenContext();
  const { data: requestedFriends } = useFriends({ state: 'REQUESTED' });

  const isRequestedFriendExist = requestedFriends && requestedFriends.length !== 0;

  const openAddFriendModal = () => dispatch({ type: 'setRequestFriendModalOpen', isOpen: true });
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
      <RequestFriendsBottomSheetContent />
    </>
  );
};

const DrawerContent = ({ navigation }: DrawerContentComponentProps) => {
  return <ManageFriendsDrawerContent onClose={() => navigation.closeDrawer()} />;
};

export const useRequestFriend = () => {
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
