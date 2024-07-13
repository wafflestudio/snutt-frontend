import { useMainScreenContext } from '..';
import { BottomSheet } from '../../../components/BottomSheet';
import { RequestFriendsMethodList } from './RequestFriendsMethodList';
import { RequestFriendsWithNickname } from './RequestFriendsWithNickname';

export const RequestFriendsBottomSheetContent = () => {
  const { isRequestFriendModalOpen, requestFriendModalStep, dispatch } = useMainScreenContext();

  const closeAddFriendModal = () => dispatch({ type: 'setRequestFriendModalOpen', isOpen: false });

  return (
    <BottomSheet isOpen={isRequestFriendModalOpen} onClose={closeAddFriendModal}>
      {requestFriendModalStep === 'METHOD_LIST' ? <RequestFriendsMethodList /> : <RequestFriendsWithNickname />}
    </BottomSheet>
  );
};
