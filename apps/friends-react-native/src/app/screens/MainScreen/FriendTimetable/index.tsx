import { StyleSheet, View } from 'react-native';

import { EmptyView } from '../../../components/EmptyView';
import { UserIcon } from '../../../components/Icons/UserIcon';
import { Paper } from '../../../components/Paper';
import { Select } from '../../../components/Select';
import { Timetable } from '../../../components/Timetable';
import { Typography } from '../../../components/Typography';
import { useServiceContext } from '../../../contexts/ServiceContext';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { useColors } from '../../../queries/useColors';
import { useFriendCourseBooks } from '../../../queries/useFriendCourseBooks';
import { useFriendPrimaryTable } from '../../../queries/useFriendPrimaryTable';
import { useFriends } from '../../../queries/useFriends';
import { useMainScreenContext } from '..';
import { FriendGuideModal } from '../FriendGuideModal';
import { FriendGuide } from './FriendGuide';

export const FriendTimetable = () => {
  const { selectedFriendId, selectedCourseBook, dispatch } = useMainScreenContext();
  const { courseBookService, friendService } = useServiceContext();
  const primaryColor = useThemeContext((data) => data.color.text.primary);
  const { data: friends } = useFriends({ state: 'ACTIVE' });
  const { data: courseBooks } = useFriendCourseBooks(selectedFriendId);
  const { data: fullTimetable } = useFriendPrimaryTable(
    selectedCourseBook && selectedFriendId && { friendId: selectedFriendId, courseBook: selectedCourseBook },
  );
  const { data: palette } = useColors(fullTimetable);
  const selectedFriend = friends?.find((f) => f.friendId === selectedFriendId);

  if (!friends) return null;

  const isTimetableEmpty = courseBooks?.length === 0;

  return (
    <Paper style={styles.wrapper}>
      {friends.length !== 0 ? (
        <FriendGuide />
      ) : (
        <>
          <View style={styles.header}>
            <UserIcon width={16} height={16} style={{ color: primaryColor }} />
            <Typography style={{ ...styles.nickname, color: primaryColor }}>
              {selectedFriend && friendService.formatNickname(selectedFriend)}
            </Typography>

            {!isTimetableEmpty && (
              <Select
                value={selectedCourseBook && courseBookService.toValue(selectedCourseBook)}
                onChange={(v) => dispatch({ type: 'setCourseBook', courseBook: courseBookService.fromValue(v) })}
                items={courseBooks?.map((cb) => ({
                  label: courseBookService.toLabel(cb),
                  value: courseBookService.toValue(cb),
                }))}
              />
            )}
          </View>
          {isTimetableEmpty ? (
            <View style={styles.emptyWrapper}>
              <EmptyView size="big" title="친구에게 대표 시간표가 없습니다." />
            </View>
          ) : (
            palette && <Timetable palette={palette} timetable={fullTimetable ?? { lectures: [] }} />
          )}
        </>
      )}
      <FriendGuideModal />
    </Paper>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 36,
    gap: 2,
  },
  nickname: { fontSize: 14, fontWeight: '500', flex: 1 },
  emptyWrapper: { marginBottom: 100 },
});
