import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FlatList, StyleSheet, View } from 'react-native';

import { FriendId } from '../../../../../entities/friend';
import { Button } from '../../../../components/Button';
import { EmptyView } from '../../../../components/EmptyView';
import { Typography } from '../../../../components/Typography';
import { useServiceContext } from '../../../../contexts/ServiceContext';
import { useFriends } from '../../../../queries/useFriends';

type Props = {};

export const ManageFriendsDrawerContentRequestedList = ({}: Props) => {
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
          <Button color="gray" onPress={() => declineFriend(item.friendId)}>
            거절
          </Button>
          <Button color="primary" onPress={() => acceptFriend(item.friendId)}>
            승인
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
  listContainer: { flexGrow: 1 },
});
