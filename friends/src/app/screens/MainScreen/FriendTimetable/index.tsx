import { StyleSheet, View } from 'react-native';

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
import { FriendGuide } from './FriendGuide';

export const FriendTimetable = () => {
  const { selectedFriendId, selectedCourseBook, dispatch } = useMainScreenContext();
  const { courseBookService, friendService } = useServiceContext();
  const primaryColor = useThemeContext((data) => data.color.text.primary);
  const { data: friends } = useFriends({ state: 'ACTIVE' });
  const { data: palette } = useColors();
  const { data: courseBooks } = useFriendCourseBooks(selectedFriendId);
  const { data: fullTimetable } = useFriendPrimaryTable(
    selectedCourseBook && selectedFriendId && { friendId: selectedFriendId, courseBook: selectedCourseBook },
  );
  const selectedFriend = friends?.find((f) => f.friendId === selectedFriendId);

  if (!friends) return;

  if (friends.length === 0) return <FriendGuide />;

  return (
    <Paper style={styles.wrapper}>
      <View style={styles.header}>
        <UserIcon width={16} height={16} style={{ color: primaryColor }} />
        <Typography style={{ ...styles.nickname, color: primaryColor }}>
          {selectedFriend && friendService.formatNickname(selectedFriend)}
        </Typography>

        <Select
          value={selectedCourseBook && courseBookService.toValue(selectedCourseBook)}
          onChange={(v) => dispatch({ type: 'setCourseBook', courseBook: courseBookService.fromValue(v) })}
          items={courseBooks?.map((cb) => ({
            label: `${cb.year}-${cb.semester}`,
            value: courseBookService.toValue(cb),
          }))}
        />
      </View>
      {palette && <Timetable palette={palette} timetable={fullTimetable ?? { lectures: [] }} />}
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
});
