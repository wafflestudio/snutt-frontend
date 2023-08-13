import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useFriends } from '../../../../queries/useFriends';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FriendId } from '../../../../../entities/friend';
import { useServiceContext } from '../../../../../main';

type Props = {};

export const ManageFriendsDrawerContentRequestedList = ({}: Props) => {
  const { friendService } = useServiceContext();
  const { data: requestedFriends } = useFriends({ state: 'REQUESTED' });

  const { mutate: acceptFriend } = useAcceptFriend();
  const { mutate: declineFriend } = useDeclineFriend();

  return (
    <View>
      <FlatList
        data={requestedFriends}
        renderItem={({ item }) => (
          <View key={item.friendId}>
            <Text>{friendService.formatNickname(item)}</Text>
            <TouchableOpacity onPress={() => acceptFriend(item.friendId)}>
              <Text>승인</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => declineFriend(item.friendId)}>
              <Text>거절</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const useAcceptFriend = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation((friendId: FriendId) => friendService.acceptFriend({ friendId }), {
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

const useDeclineFriend = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation((friendId: FriendId) => friendService.declineFriend({ friendId }), {
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
