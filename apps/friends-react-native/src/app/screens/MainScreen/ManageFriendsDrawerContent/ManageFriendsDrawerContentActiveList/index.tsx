import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { FriendId } from '../../../../../entities/friend';
import { get } from '../../../../../utils/get';
import { BottomSheet } from '../../../../components/BottomSheet';
import { EmptyView } from '../../../../components/EmptyView';
import { MoreIcon } from '../../../../components/Icons/MoreIcon';
import { PencilIcon } from '../../../../components/Icons/PencilIcon';
import { TrashIcon } from '../../../../components/Icons/TrashIcon';
import { UserPlusIcon } from '../../../../components/Icons/UserPlusIcon';
import { Input } from '../../../../components/Input';
import { Typography } from '../../../../components/Typography';
import { useServiceContext } from '../../../../contexts/ServiceContext';
import { useThemeContext } from '../../../../contexts/ThemeContext';
import { useFriends } from '../../../../queries/useFriends';
import { useMainScreenContext } from '../..';

type Props = { onClickFriend: (friendId: FriendId) => void };

export const ManageFriendsDrawerContentActiveList = ({ onClickFriend }: Props) => {
  const { friendService } = useServiceContext();
  const { data: activeFriends } = useFriends({ state: 'ACTIVE' });
  const { mutate: deleteFriend } = useDeleteFriend();
  const { mutate: patchDisplayName } = usePatchDisplayName();
  const moreIconColor = useThemeContext((data) => data.color.text.description);
  const activeItemBackgroundColor = useThemeContext((data) => data.color.bg.listActiveItem);
  const { dispatch, selectedFriendId } = useMainScreenContext();

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
    <>
      <FlatList
        data={activeFriends}
        ListEmptyComponent={Empty}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.friendId}
            style={[
              styles.item,
              { backgroundColor: item.friendId === selectedFriendId ? activeItemBackgroundColor : undefined },
            ]}
            onPress={() => onClickFriend(item.friendId)}
          >
            <Typography style={styles.nickname}>{friendService.formatNickname(item)}</Typography>

            <TouchableOpacity
              onPress={() => setBottomSheetState({ isOpen: true, friendId: item.friendId, type: 'detail' })}
            >
              <MoreIcon width={30} height={30} style={{ color: moreIconColor }} />
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
              <Typography>친구 이름 설정</Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                Alert.alert('친구 삭제', '정말로 친구를 삭제하시겠습니까?', [
                  { text: '취소' },
                  {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () =>
                      deleteFriend(bottomSheetState.friendId, {
                        onSuccess: () => {
                          setBottomSheetState({ isOpen: false });
                          dispatch({ type: 'setFriend', friendId: undefined });
                        },
                      }),
                  },
                ]);
              }}
            >
              <TrashIcon width={30} height={30} />
              <Typography>친구 목록에서 삭제</Typography>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.displayNameSheetContent}>
            <BottomSheet.Header
              left={{
                text: '취소',
                onPress: () =>
                  setBottomSheetState({ isOpen: true, type: 'detail', friendId: bottomSheetState.friendId }),
              }}
              right={{
                text: '적용',
                onPress: () =>
                  patchDisplayName(bottomSheetState, {
                    onSuccess: () => setBottomSheetState({ isOpen: false }),
                    onError: (err) => {
                      const message = get(err, ['displayMessage']);
                      Alert.alert(message ? `${message}` : '오류가 발생했습니다.');
                    },
                  }),
                disabled: !isDisplayNameModifyable,
              }}
            />
            <View style={styles.displayNameInfo}>
              <Typography variant="description" style={styles.displayNameInfoText}>
                나에게 표시될 친구 이름
              </Typography>
              <Typography variant="description" style={styles.displayNameInfoCaption}>
                (공백 포함 한/영/숫자 10자 이내)
              </Typography>
            </View>
            <Input
              style={styles.displayNameInput}
              value={bottomSheetState.displayName}
              autoFocus
              onChange={(e) => setBottomSheetState({ ...bottomSheetState, displayName: e })}
            />
            <Typography variant="guide" style={styles.displayNameInputCaption}>
              친구 닉네임: {bottomSheetFriend && friendService.formatNickname(bottomSheetFriend, { type: 'nickname' })}
            </Typography>
          </View>
        )}
      </BottomSheet>
    </>
  );
};

const Empty = () => {
  const { description } = useThemeContext(({ color }) => color.text);
  return (
    <EmptyView
      title="추가한 친구가 없습니다."
      descriptions={[
        <>
          <Typography style={{ color: description }}>
            친구 추가하기 <UserPlusIcon width={11} height={11} />
          </Typography>
          를 눌러 요청을 보내보세요!
        </>,
        '친구가 수락하면 이 곳에 추가됩니다.',
      ]}
    />
  );
};

const useDeleteFriend = () => {
  const queryClient = useQueryClient();
  const { friendService } = useServiceContext();
  return useMutation((friendId: FriendId) => friendService.deleteFriend({ friendId }), {
    onSuccess: () => queryClient.invalidateQueries(['friends']),
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
  item: { height: 40, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 24 },
  nickname: { flex: 1, lineHeight: 15, fontSize: 14 },
  listContainer: { flexGrow: 1 },

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
  displayNameInfoText: { fontSize: 14 },
  displayNameInfoCaption: { fontSize: 10, marginTop: 2 },
  displayNameInput: { marginTop: 16, fontSize: 14 },
  displayNameInputCaption: { marginTop: 7, fontSize: 12 },
});
