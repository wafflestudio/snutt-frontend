import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useServiceContext } from '../../../../main';
import { FriendId } from '../../../../entities/friend';
import { useFriends } from '../../../queries/useFriends';
import { useMainScreenContext } from '..';

type Props = {
  onClose: () => void;
};

export const ManageFriendsDrawerContent = ({ onClose }: Props) => {
  const { onSelectFriend } = useMainScreenContext();
  const { data: requestedFriends } = useFriends({ state: 'REQUESTED' });
  const { data: activeFriends } = useFriends({ state: 'ACTIVE' });
  const { mutate: acceptFriend } = useAcceptFriend();
  const { mutate: declineFriend } = useDeclineFriend();
  const { mutate: deleteFriend } = useDeleteFriend();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>SNUTT</Text>
        <TouchableOpacity onPress={onClose}>
          <Text>X</Text>
        </TouchableOpacity>
      </View>
      <Text>요청받은거</Text>
      <FlatList
        data={requestedFriends}
        renderItem={({ item }) => (
          <View>
            <Text>
              {item.nickname}#{item.tag}
            </Text>
            <TouchableOpacity onPress={() => acceptFriend(item.friendId)}>
              <Text>승인</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => declineFriend(item.friendId)}>
              <Text>거절</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Text>친구 목록</Text>
      <FlatList
        data={activeFriends}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              onPress={() => {
                onSelectFriend(item.friendId);
                onClose();
              }}
            >
              <Text>
                {item.nickname}#{item.tag}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteFriend(item.friendId, { onSuccess: () => onSelectFriend(undefined) })}
            >
              <Text>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 22.5, paddingHorizontal: 20 },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

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

const useDeleteFriend = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation((friendId: FriendId) => friendService.deleteFriend({ friendId }), {
    onSuccess: () => queryClient.invalidateQueries(),
  });
};
