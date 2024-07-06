import { StyleSheet, View } from 'react-native';

import { Typography } from '../../../../components/Typography';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { UserHashtagIcon } from '../../../../components/Icons/UserHashtagIcon';
import { useThemeContext } from '../../../../contexts/ThemeContext';
import { KakaotalkIcon } from '../../../../components/Icons/Kakaotalk';
import { RequestFriendModalStep, useMainScreenContext } from '../..';
import { useRequestFriendToken } from '../../../../queries/useRequestFriendToken';
import { useServiceContext } from '../../../../contexts/ServiceContext';

export const RequestFriendsMethodList = () => {
  const { dispatch } = useMainScreenContext();
  const { nativeEventService } = useServiceContext();
  const { data } = useRequestFriendToken();
  const iconColor = useThemeContext((theme) => theme.color.text.default);

  const setRequestFriendModalStep = (step: RequestFriendModalStep) =>
    dispatch({
      type: 'setRequestFriendModalStep',
      requestFriendModalStep: step,
    });

  const requestFriendWithKakao = () => {
    const parameters = {
      requestToken: data!.requestToken,
    };

    nativeEventService.sendEventToNative({
      type: 'add-friend-kakao',
      parameters,
    });

    dispatch({
      type: 'setRequestFriendModalOpen',
      isOpen: false,
    });
  };

  return (
    <>
      <View style={styles.sheetContent}>
        <TouchableOpacity style={styles.sheetItem} onPress={requestFriendWithKakao}>
          <KakaotalkIcon
            width={30}
            height={30}
            style={{
              color: iconColor,
            }}
          />
          <Typography>카카오톡으로 친구 초대</Typography>
        </TouchableOpacity>
      </View>
      <View style={styles.sheetContent}>
        <TouchableOpacity style={styles.sheetItem} onPress={() => setRequestFriendModalStep('REQUEST_WITH_NICKNAME')}>
          <UserHashtagIcon
            width={30}
            height={30}
            style={{
              color: iconColor,
            }}
          />
          <Typography>닉네임으로 친구 초대</Typography>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  sheetContent: { paddingBottom: 20 },
  sheetItem: {
    height: 50,
    paddingVertical: 10,
    display: 'flex',
    flexDirection: 'row',
    gap: 25,
    alignItems: 'center',
  },
});
