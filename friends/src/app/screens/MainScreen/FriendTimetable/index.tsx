import { StyleSheet, Text, View } from 'react-native';
import { Timetable } from '../../../components/Timetable';
import { useColors } from '../../../queries/useColors';
import { useTimetable } from '../../../queries/useTimetable';

export const FriendTimetable = () => {
  const { data: palette } = useColors();
  const { data: fullTimetable } = useTimetable('5e0d6d973c46177d58bb91b9');

  return (
    <View>
      <View>
        <Text>고독한 딸기와플#9117</Text>
        <Text>2023-여름학기</Text>
      </View>
      {palette && fullTimetable && <Timetable style={styles.timetable} palette={palette} timetable={fullTimetable} />}
    </View>
  );
};

const styles = StyleSheet.create({ timetable: { margin: 8 } });
