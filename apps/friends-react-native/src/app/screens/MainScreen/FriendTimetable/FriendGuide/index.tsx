import { StyleSheet, TouchableOpacity } from 'react-native';

import { EmptyView } from '../../../../components/EmptyView';
// import { HamburgerIcon } from '../../../../components/Icons/HamburgerIcon';
import { QuestionIcon } from '../../../../components/Icons/QuestionIcon';
import { UserPlusIcon } from '../../../../components/Icons/UserPlusIcon';
import { Paper } from '../../../../components/Paper';
import { Typography } from '../../../../components/Typography';
import { useThemeContext } from '../../../../contexts/ThemeContext';
import { useMainScreenContext } from '../..';
import { CheckIcon } from '../../../../components/Icons/CheckIcon';
import { View } from 'react-native-reanimated/lib/typescript/Animated';

export const FriendGuide = () => {
  const { dispatch } = useMainScreenContext();
  const {
    color: {
      text: { caption, hint },
    },
  } = useThemeContext();

  const openGuideModal = () => dispatch({ type: 'setGuideModalOpen', isOpen: true });

  return (
    <Paper style={styles.wrapper}>
      <EmptyView
        size="big"
        title="망한 시간표 대회 참여 방법"
        catType="waffle"
        descriptions={[
          <View style={styles.description}>
            <CheckIcon style={{ color: caption }} width={12} height={12} /> 우측 상단{' '}
            <UserPlusIcon style={{ color: caption }} width={12} height={12} /> 을 눌러{' '}
            <Typography style={styles.bold}>'수신망한와플#7777'</Typography>로
          </View>,
          <View style={styles.description}>친구 요청을 보내주시면 자동 신청됩니다.</View>,
          <View style={styles.description}>
            <CheckIcon style={{ color: caption }} width={12} height={12} /> 2025년 1학기 시간표 중 하나가
          </View>,
          <View style={styles.description}>
            <Typography style={styles.bold}>'대표 시간표'</Typography>로 지정되어 있는지 확인해주세요.
          </View>,
          <View style={styles.description}>
            <CheckIcon style={{ color: caption }} width={12} height={12} /> 발표(3/30) 전에 친구 삭제 시 무효
            처리됩니다.
          </View>,
          // <>
          //   친구가 수락하면 사이드바 <HamburgerIcon style={{ color: caption }} width={12} height={12} /> 친구 목록에
          //   추가됩니다.
          // </>,
        ]}
        // title="추가한 친구가 없습니다."
        // descriptions={[
        //   <>
        //     우측 상단 <UserPlusIcon style={{ color: caption }} width={12} height={12} /> 을 눌러
        //   </>,
        //   '시간표를 공유하고 싶은 친구에게 친구 요청을 보내보세요!',
        //   <>
        //     친구가 수락하면 사이드바 <HamburgerIcon style={{ color: caption }} width={12} height={12} /> 친구 목록에
        //     추가됩니다.
        //   </>,
        // ]}
        etc={
          <TouchableOpacity onPress={openGuideModal} style={styles.detailButton}>
            <QuestionIcon style={{ color: hint }} width={12} height={12} />
            <Typography variant="hint" style={styles.hint}>
              자세히 보기
            </Typography>
          </TouchableOpacity>
        }
      />
    </Paper>
  );
};

const styles = StyleSheet.create({
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 },
  typoMargin4: { paddingTop: 8 },
  detailButton: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  description: { width: 450 },
  hint: { textDecorationLine: 'underline', fontSize: 10 },
  bold: { fontWeight: 'bold' },
});
