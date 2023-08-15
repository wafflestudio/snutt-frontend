import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FriendId } from '../../../../../entities/friend';
import { useFriends } from '../../../../queries/useFriends';
import { useServiceContext } from '../../../../../main';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Props = { onClickFriend: (friendId: FriendId) => void };

export const ManageFriendsDrawerContentActiveList = ({}: Props) => {
  const { friendService } = useServiceContext();
  const { data: activeFriends } = useFriends({ state: 'ACTIVE' });
  const { mutate: deleteFriend } = useDeleteFriend();

  return (
    <View>
      <FlatList
        data={activeFriends}
        renderItem={({ item }) => (
          <View key={item.friendId} style={styles.item}>
            <Text style={styles.nickname}>{friendService.formatNickname(item)}</Text>

            <TouchableOpacity onPress={() => deleteFriend(item.friendId)}>
              <Text>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const useDeleteFriend = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation((friendId: FriendId) => friendService.deleteFriend({ friendId }), {
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

const styles = StyleSheet.create({
  item: { height: 40, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 },
  nickname: { flex: 1, lineHeight: 15, fontSize: 13 },
});
