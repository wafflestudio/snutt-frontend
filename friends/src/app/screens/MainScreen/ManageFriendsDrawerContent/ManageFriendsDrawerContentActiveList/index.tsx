import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FriendId } from '../../../../../entities/friend';
import { BottomSheet } from '../../../../components/BottomSheet';
import { MoreIcon } from '../../../../components/Icons/MoreIcon';
import { PencilIcon } from '../../../../components/Icons/PencilIcon';
import { TrashIcon } from '../../../../components/Icons/PencilIcon copy';
import { Input } from '../../../../components/Input';
import { useServiceContext } from '../../../../contexts/ServiceContext';
import { useFriends } from '../../../../queries/useFriends';
import { useMainScreenContext } from '../..';

type Props = { onClickFriend: (friendId: FriendId) => void };

export const ManageFriendsDrawerContentActiveList = ({}: Props) => {
  const { friendService } = useServiceContext();
  const { data: activeFriends } = useFriends({ state: 'ACTIVE' });
  const { mutate: deleteFriend } = useDeleteFriend();
  const { mutate: patchDisplayName } = usePatchDisplayName();
  const { dispatch } = useMainScreenContext();
  const [bottomSheetState, setBottomSheetState] = useState<
    | { isOpen: false }
    | ({ isOpen: true; friendId: FriendId } & ({ type: 'detail' } | { type: 'setNickname'; displayName: string }))
  >({ isOpen: false });
  const bottomSheetFriend = bottomSheetState.isOpen
    ? activeFriends?.find((f) => f.friendId === bottomSheetState.friendId)
    : undefined;
  const isDisplayNameModifyable =
    bottomSheetState.isOpen &&
    bottomSheetState.type === 'setNickname' &&
    bottomSheetState.displayName !== bottomSheetFriend?.displayName &&
    friendService.isValidDisplayName(bottomSheetState.displayName);

  return (
    <View>
      <FlatList
        data={activeFriends}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.friendId}
            style={styles.item}
            onPress={() => dispatch({ type: 'setFriend', friendId: item.friendId })}
          >
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
        {!bottomSheetState.isOpen ? null : bottomSheetState.type === 'detail' ? (
          <View style={styles.sheetContent}>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                const friend = activeFriends?.find((f) => f.friendId === bottomSheetState.friendId);
                setBottomSheetState({
                  isOpen: true,
                  friendId: bottomSheetState.friendId,
                  type: 'setNickname',
                  displayName: friend?.displayName ?? '',
                });
              }}
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
        ) : (
          <View style={styles.displayNameSheetContent}>
            <BottomSheet.Header
              left={{ text: '취소', onPress: () => setBottomSheetState({ isOpen: false }) }}
              right={{
                text: '적용',
                onPress: () =>
                  patchDisplayName(bottomSheetState, { onSuccess: () => setBottomSheetState({ isOpen: false }) }),
                disabled: !isDisplayNameModifyable,
              }}
            />
            <View style={styles.displayNameInfo}>
              <Text style={styles.displayNameInfoText}>나에게 표시될 친구 이름</Text>
              <Text style={styles.displayNameInfoCaption}>(공백 포함 한/영 10자 이내)</Text>
            </View>
            <Input
              style={styles.displayNameInput}
              value={bottomSheetState.displayName}
              onChange={(e) => setBottomSheetState({ ...bottomSheetState, displayName: e })}
            />
            <Text style={styles.displayNameInputCaption}>
              친구 닉네임: {bottomSheetFriend && friendService.formatNickname(bottomSheetFriend, { type: 'nickname' })}
            </Text>
          </View>
        )}
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

const usePatchDisplayName = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation(
    ({ friendId, displayName }: { friendId: FriendId; displayName: string }) =>
      friendService.patchFriendDisplayName({ friendId, displayName }),
    { onSuccess: () => queryClient.invalidateQueries() },
  );
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

  displayNameSheetContent: { paddingBottom: 30 },
  displayNameInfo: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayNameInfoText: { fontSize: 14, color: '#777777' },
  displayNameInfoCaption: { fontSize: 10, color: '#777777', marginTop: 2 },
  displayNameInput: { marginTop: 16, fontSize: 14, color: '#0e0e0e' },
  displayNameInputCaption: { marginTop: 5, fontSize: 10, color: '#00b8b0' },
});
