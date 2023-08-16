import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Timetable } from '../../../components/Timetable';
import { useColors } from '../../../queries/useColors';
import { useMainScreenContext } from '..';
import { useFriendRegisteredCourseBooks } from '../../../queries/useFriendRegisteredCourseBooks';
import { useState } from 'react';

import { CourseBook } from '../../../../entities/courseBook';
import { useFriends } from '../../../queries/useFriends';
import { useFriendPrimaryTable } from '../../../queries/useFriendPrimaryTable';

import { useServiceContext } from '../../../../main';
import { Select } from '../../../components/Select';
import { UserIcon } from '../../../components/Icons/UserIcon';
import { FriendGuide } from './FriendGuide';

export const FriendTimetable = () => {
  const { courseBookService } = useServiceContext();
  const { data: friends } = useFriends({ state: 'ACTIVE' });
  const [selectedCourseBook, setSelectedCourseBook] = useState<CourseBook>();
  const { selectedFriendId } = useMainScreenContext();
  const { data: palette } = useColors();
  const { data: courseBooks } = useFriendRegisteredCourseBooks(selectedFriendId);
  const selectedCourseBookWithDefault = selectedCourseBook ?? courseBooks?.at(0);
  const { data: fullTimetable } = useFriendPrimaryTable(
    selectedCourseBookWithDefault &&
      selectedFriendId && {
        friendId: selectedFriendId,
        courseBook: selectedCourseBookWithDefault,
      },
    { keepPreviousData: true },
  );
  const selectedFriend = friends?.find((f) => f.friendId === selectedFriendId);

  if (!friends) return;

  if (friends.length === 0) return <FriendGuide />;

  return (
    <ScrollView style={styles.wrapper}>
      <View style={styles.header}>
        <UserIcon width={16} height={16} style={styles.userIcon} />

        <Text style={styles.nickname}>
          {selectedFriend?.nickname}#{selectedFriend?.tag}
        </Text>

        <Select
          value={selectedCourseBookWithDefault && courseBookService.toValue(selectedCourseBookWithDefault)}
          onChange={(v) => setSelectedCourseBook(courseBookService.fromValue(v))}
          items={courseBooks?.map((cb) => ({
            label: `${cb.year}-${cb.semester}`,
            value: courseBookService.toValue(cb),
          }))}
        />
      </View>
      {palette && fullTimetable && <Timetable palette={palette} timetable={fullTimetable} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrapper: { backgroundColor: 'white' },
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
