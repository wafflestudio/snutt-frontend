import { Text, View } from 'react-native';
import { FullTimetable } from '../../entities/timetable';

type Props = { timetable: FullTimetable };

export const Timetable = ({ timetable }: Props) => {
  return (
    <View>
      <Text>{JSON.stringify(timetable)}</Text>
    </View>
  );
};
