import { Alert } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { get } from '../../../../../utils/get';
import { BottomSheet } from '../../../../components/BottomSheet';
import { WarningIcon } from '../../../../components/Icons/WarningIcon';
import { Input } from '../../../../components/Input';
import { Typography } from '../../../../components/Typography';
import { COLORS } from '../../../../styles/colors';
import { useMainScreenContext, useRequestFriend } from '../..';
import { useServiceContext } from '../../../../contexts/ServiceContext';
import { useThemeContext } from '../../../../contexts/ThemeContext';

export const RequestFriendsWithNickname = () => {
  const { addFriendModalNickname, dispatch } = useMainScreenContext();
  const { friendService } = useServiceContext();
  const guideEnabledColor = useThemeContext((data) => data.color.text.guide);
  const { mutate: request } = useRequestFriend();

  const isValid = friendService.isValidNicknameTag(addFriendModalNickname);
  const guideMessageState = addFriendModalNickname === '' ? 'disabled' : isValid ? 'hidden' : 'enabled';

  const closeAddFriendModal = () => dispatch({ type: 'setAddFriendModalOpen', isOpen: false });

  return (
    <View style={styles.modalContent}>
      <BottomSheet.Header
        left={{ text: '취소', onPress: closeAddFriendModal }}
        right={{
          text: '요청 보내기',
          onPress: () =>
            request(addFriendModalNickname, {
              onSuccess: () => {
                Alert.alert('친구에게 요청을 보냈습니다.');
                closeAddFriendModal();
              },
              onError: (err) => {
                const displayMessage = get(err, ['displayMessage']);
                Alert.alert(displayMessage ? `${displayMessage}` : '오류가 발생했습니다.');
              },
            }),
          disabled: !isValid,
        }}
      />
      <Typography variant="description" style={styles.inputDescription}>
        추가하고 싶은 친구의 닉네임
      </Typography>
      <Input
        style={styles.input}
        autoFocus
        value={addFriendModalNickname}
        onChange={(e) => dispatch({ type: 'setAddFriendModalNickname', nickname: e })}
        placeholder="예) 홍길동#1234"
      />
      <View style={styles.guide}>
        {guideMessageState !== 'hidden' &&
          (() => {
            const color = { enabled: guideEnabledColor, disabled: COLORS.gray40 }[guideMessageState];
            return (
              <>
                <WarningIcon width={18} height={18} style={{ color }} />
                <Typography variant="description" style={{ ...styles.guideText, color }}>
                  닉네임 전체를 입력하세요
                </Typography>
              </>
            );
          })()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  questionIconButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  questionIcon: { color: COLORS.gray30 },
  modalContent: { paddingBottom: 30 },
  inputDescription: { marginTop: 30, fontSize: 14 },
  input: { marginTop: 15 },
  guide: {
    marginTop: 7,
    display: 'flex',
    flexDirection: 'row',
    gap: 1,
    alignItems: 'center',
    height: 12,
  },
  guideText: { fontSize: 12 },
  hamburgerWrapper: { position: 'relative' },
  hamburgerNotificationDot: { position: 'absolute', top: 5, right: -1 },
});
