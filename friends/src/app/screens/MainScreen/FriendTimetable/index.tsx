import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Timetable } from '../../../components/Timetable';
import { useColors } from '../../../queries/useColors';
import { useMainScreenContext } from '..';
import { useFriendRegisteredCourseBooks } from '../../../queries/useFriendRegisteredCourseBooks';
import { useState } from 'react';

import { CourseBook } from '../../../../entities/courseBook';
import { useFriends } from '../../../queries/useFriends';
import { useFriendPrimaryTable } from '../../../queries/useFriendPrimaryTable';

export const FriendTimetable = () => {
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
  );
  const selectedFriend = friends?.find((f) => f.friendId === selectedFriendId);

  return (
    <ScrollView style={styles.wrapper}>
      <View>
        <Text>
          {selectedFriend?.nickname}#{selectedFriend?.tag}
        </Text>
        {courseBooks?.map((c) => (
          <TouchableOpacity key={c.year + '-' + c.semester} onPress={() => setSelectedCourseBook(c)}>
            <Text>
              {c.year}-{c.semester}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {palette && fullTimetable && <Timetable style={styles.timetable} palette={palette} timetable={fullTimetable} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({ wrapper: { backgroundColor: 'white' }, timetable: { margin: 8 } });
