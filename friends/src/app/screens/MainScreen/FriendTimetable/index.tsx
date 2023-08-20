import { StyleSheet, Text, View } from 'react-native';

import { UserIcon } from '../../../components/Icons/UserIcon';
import { Paper } from '../../../components/Paper';
import { Select } from '../../../components/Select';
import { Timetable } from '../../../components/Timetable';
import { useServiceContext } from '../../../contexts/ServiceContext';
import { useColors } from '../../../queries/useColors';
import { useFriendCourseBooks } from '../../../queries/useFriendCourseBooks';
import { useFriendPrimaryTable } from '../../../queries/useFriendPrimaryTable';
import { useFriends } from '../../../queries/useFriends';
import { useMainScreenContext } from '..';
import { FriendGuide } from './FriendGuide';

export const FriendTimetable = () => {
  const { selectedFriendId, selectedCourseBook, dispatch } = useMainScreenContext();
  const { courseBookService, friendService } = useServiceContext();
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
    <Paper>
      <View style={styles.header}>
        <UserIcon width={16} height={16} style={styles.userIcon} />

        <Text style={styles.nickname}>{selectedFriend && friendService.formatNickname(selectedFriend)}</Text>

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
  userIcon: { color: '#00B8B0' },
  nickname: { fontSize: 14, fontWeight: '500', color: '#1ca6a0', flex: 1 },
});
