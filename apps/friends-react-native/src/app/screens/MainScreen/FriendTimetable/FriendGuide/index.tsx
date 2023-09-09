import { StyleSheet, TouchableOpacity } from 'react-native';

import { EmptyView } from '../../../../components/EmptyView';
import { HamburgerIcon } from '../../../../components/Icons/HamburgerIcon';
import { QuestionIcon } from '../../../../components/Icons/QuestionIcon';
import { UserPlusIcon } from '../../../../components/Icons/UserPlusIcon';
import { Paper } from '../../../../components/Paper';
import { Typography } from '../../../../components/Typography';
import { useThemeContext } from '../../../../contexts/ThemeContext';
import { useMainScreenContext } from '../..';

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
        title="추가한 친구가 없습니다."
        descriptions={[
          <>
            우측 상단 <UserPlusIcon style={{ color: caption }} width={12} height={12} /> 을 눌러
          </>,
          '시간표를 공유하고 싶은 친구에게 친구 요청을 보내보세요!',
          <>
            친구가 수락하면 사이드바 <HamburgerIcon style={{ color: caption }} width={12} height={12} /> 친구 목록에
            추가됩니다.
          </>,
        ]}
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
  hint: { textDecorationLine: 'underline', fontSize: 10 },
});
