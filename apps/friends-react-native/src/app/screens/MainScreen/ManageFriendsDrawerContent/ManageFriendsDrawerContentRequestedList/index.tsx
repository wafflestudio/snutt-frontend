import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { FriendId } from '../../../../../entities/friend';
import { Button } from '../../../../components/Button';
import { EmptyView } from '../../../../components/EmptyView';
import { Typography } from '../../../../components/Typography';
import { useServiceContext } from '../../../../contexts/ServiceContext';
import { useFriends } from '../../../../queries/useFriends';

export const ManageFriendsDrawerContentRequestedList = () => {
  const { friendService } = useServiceContext();
  const { data: requestedFriends } = useFriends({ state: 'REQUESTED' });

  const { mutate: acceptFriend } = useAcceptFriend();
  const { mutate: declineFriend } = useDeclineFriend();

  return (
    <FlatList
      data={requestedFriends}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={Empty}
      renderItem={({ item }) => (
        <View style={styles.item} key={item.friendId}>
          <Typography style={styles.nickname}>{friendService.formatNickname(item)}</Typography>
          <Button
            color="gray"
            onPress={() =>
              Alert.alert('친구 요청을 거절하시겠습니까? 목록에서 삭제됩니다.', undefined, [
                { text: '취소' },
                { text: '거절', onPress: () => declineFriend(item.friendId) },
              ])
            }
          >
            거절
          </Button>
          <Button
            color="primary"
            onPress={() => acceptFriend(item.friendId, { onSuccess: () => Alert.alert('친구 요청을 수락했습니다.') })}
          >
            수락
          </Button>
        </View>
      )}
    />
  );
};

const Empty = () => {
  return (
    <EmptyView
      title="받은 친구 요청이 없습니다."
      descriptions={['친구가 나에게 요청을 보내면', '여기에서 수락 또는 거절할 수 있어요.']}
    />
  );
};

const useAcceptFriend = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation({
    mutationFn: (friendId: FriendId) => friendService.acceptFriend({ friendId }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

const useDeclineFriend = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation({
    mutationFn: (friendId: FriendId) => friendService.declineFriend({ friendId }),
    onSuccess: () => queryClient.invalidateQueries(),
  });
};

const styles = StyleSheet.create({
  item: {
    height: 40,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  nickname: { flex: 1, lineHeight: 15, fontSize: 14 },
  listContainer: { flexGrow: 1 },
});
