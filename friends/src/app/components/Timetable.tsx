import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FullTimetable } from '../../entities/timetable';
import { useServiceContext } from '../../main';
import { arrayFromRange } from '../../utils/array';
import { Fragment } from 'react';
import { Day } from '../../entities/time';

type Props = { timetable: FullTimetable; style?: ViewStyle };

export const Timetable = ({ timetable, style }: Props) => {
  const { timetableViewService } = useServiceContext();
  const [startDay, endDay] = timetableViewService.getDayRange(timetable);
  const [startHour, endHour] = timetableViewService.getHourRange(timetable);
  const times = arrayFromRange(startHour, endHour);
  const days = arrayFromRange(startDay, endDay) as Day[];

  return (
    <View style={{ ...styles.container, ...style }}>
      <View style={styles.dayRow}>
        <View style={styles.dayTimeCell} />
        {days.map((c) => (
          <View style={styles.dayCell} key={c}>
            <Text>{timetableViewService.getDayLabel(c)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.timeRows}>
        <View style={styles.timeColumn}>
          {times.map((t) => (
            <View key={t} style={styles.timeCell}>
              <Text>{t}</Text>
            </View>
          ))}
        </View>
        <View style={styles.timeGridWrapper}>
          {arrayFromRange(startHour, endHour).map((time) => {
            return (
              <Fragment key={time}>
                <View style={{ ...styles.gridRow, ...styles.gridRowFront }}>
                  {days.map((c) => (
                    <View key={c} style={styles.gridCell} />
                  ))}
                </View>
                <View style={{ ...styles.gridRow, ...styles.gridRowBack }}>
                  {days.map((c) => (
                    <View key={c} style={styles.gridCell} />
                  ))}
                </View>
              </Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const HOUR_HEIGHT = 60;
const DAY_LABEL_HEIGHT = 20;
const HOUR_LABEL_WIDTH = 20;

const styles = StyleSheet.create({
  container: { borderTopWidth: 1, borderLeftWidth: 1 },

  dayRow: { display: 'flex', flexDirection: 'row', height: DAY_LABEL_HEIGHT, borderBottomWidth: 1 },
  dayCell: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRightWidth: 1 },
  dayTimeCell: { height: DAY_LABEL_HEIGHT, width: HOUR_LABEL_WIDTH, borderRightWidth: 1 },
  timeColumn: { width: HOUR_LABEL_WIDTH, borderRightWidth: 1 },
  timeCell: { height: HOUR_HEIGHT, borderBottomWidth: 1 },
  timeRows: { display: 'flex', flexDirection: 'row' },
  timeGridWrapper: { flex: 1 },
  gridRow: { height: HOUR_HEIGHT / 2, display: 'flex', flexDirection: 'row', borderBottomWidth: 1 },
  gridRowFront: { borderBottomColor: 'gray' },
  gridRowBack: { borderBottomColor: 'black' },
  gridCell: { flex: 1, borderRightWidth: 1 },

  font: { fontSize: 10, textAlign: 'center' },
});
