import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFriends } from '../../../../queries/useFriends';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FriendId } from '../../../../../entities/friend';
import { useServiceContext } from '../../../../../main';
import { Button } from '../../../../components/Button';

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
          <View style={styles.item} key={item.friendId}>
            <Text style={styles.nickname}>{friendService.formatNickname(item)}</Text>
            <Button variant="outlined" color="gray" onPress={() => declineFriend(item.friendId)}>
              거절
            </Button>
            <Button variant="outlined" color="primary" onPress={() => acceptFriend(item.friendId)}>
              승인
            </Button>
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

const styles = StyleSheet.create({
  item: { height: 40, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 },
  nickname: { flex: 1, lineHeight: 15, fontSize: 13 },
});
