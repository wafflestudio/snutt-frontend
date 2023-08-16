import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FriendId } from '../../../../../entities/friend';
import { useFriends } from '../../../../queries/useFriends';
import { useServiceContext } from '../../../../../main';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMainScreenContext } from '../..';
import { MoreIcon } from '../../../../components/Icons/MoreIcon';
import { BottomSheet } from '../../../../components/BottomSheet';
import { useState } from 'react';
import { PencilIcon } from '../../../../components/Icons/PencilIcon';
import { TrashIcon } from '../../../../components/Icons/PencilIcon copy';
import { Input } from '../../../../components/Input';

type Props = { onClickFriend: (friendId: FriendId) => void };

export const ManageFriendsDrawerContentActiveList = ({}: Props) => {
  const { friendService } = useServiceContext();
  const { data: activeFriends } = useFriends({ state: 'ACTIVE' });
  const { mutate: deleteFriend } = useDeleteFriend();
  const { onSelectFriend } = useMainScreenContext();
  const [bottomSheetState, setBottomSheetState] = useState<
    { isOpen: false } | { isOpen: true; friendId: FriendId; type: 'detail' | 'setNickname' }
  >({ isOpen: false });

  return (
    <View>
      <FlatList
        data={activeFriends}
        renderItem={({ item }) => (
          <TouchableOpacity key={item.friendId} style={styles.item} onPress={() => onSelectFriend(item.friendId)}>
            <Text style={styles.nickname}>{friendService.formatNickname(item)}</Text>

            <TouchableOpacity
              onPress={() => setBottomSheetState({ isOpen: true, friendId: item.friendId, type: 'detail' })}
            >
              <MoreIcon style={styles.more} width={30} height={30} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <BottomSheet isOpen={bottomSheetState.isOpen} onClose={() => setBottomSheetState({ isOpen: false })}>
        {bottomSheetState.isOpen &&
          {
            detail: (
              <View style={styles.sheetContent}>
                <TouchableOpacity
                  style={styles.sheetItem}
                  onPress={() =>
                    setBottomSheetState({ isOpen: true, friendId: bottomSheetState.friendId, type: 'setNickname' })
                  }
                >
                  <PencilIcon width={30} height={30} />
                  <Text>친구 이름 설정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sheetItem}
                  onPress={() =>
                    deleteFriend(bottomSheetState.friendId, { onSuccess: () => setBottomSheetState({ isOpen: false }) })
                  }
                >
                  <TrashIcon width={30} height={30} />
                  <Text>친구 목록에서 삭제</Text>
                </TouchableOpacity>
              </View>
            ),
            setNickname: (
              <View style={styles.sheetContent}>
                <View>
                  <TouchableOpacity>
                    <Text>취소</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text>적용</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <Text>나에게 표시될 친구 이름</Text>
                  <Text>(공백 포함 한/영 10자 이내)</Text>
                </View>
                <Input value="" onChange={() => null} />
                <Text>친구 닉네임: </Text>
              </View>
            ),
          }[bottomSheetState.type]}
      </BottomSheet>
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
  more: { color: '#777777' },

  sheetContent: { paddingBottom: 20 },
  sheetItem: {
    height: 50,
    paddingVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    gap: 25,
    alignItems: 'center',
  },
  sheetItemText: { fontSize: 14 },
});
