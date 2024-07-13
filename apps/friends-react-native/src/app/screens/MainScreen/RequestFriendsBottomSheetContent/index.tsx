import { StyleSheet, View } from 'react-native';
import { useMainScreenContext } from '..';
import { BottomSheet } from '../../../components/BottomSheet';
import { RequestFriendsMethodList } from './RequestFriendsMethodList';
import { RequestFriendsWithNickname } from './RequestFriendsWithNickname';

export const RequestFriendsBottomSheetContent = () => {
  const { isRequestFriendModalOpen, requestFriendModalStep, dispatch } = useMainScreenContext();

  const closeAddFriendModal = () => dispatch({ type: 'setRequestFriendModalOpen', isOpen: false });

  return (
    <View style={styles.container}>
      <View style={styles.tabContent}>
        <BottomSheet isOpen={isRequestFriendModalOpen} onClose={closeAddFriendModal}>
          {requestFriendModalStep === 'METHOD_LIST' ? <RequestFriendsMethodList /> : <RequestFriendsWithNickname />}
        </BottomSheet>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 22, height: '100%', display: 'flex' },
  tabContent: { paddingTop: 16, flex: 1 },
});
