import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { FullTimetable } from '../../entities/timetable';
import { useServiceContext } from '../../main';
import { arrayFromRange } from '../../utils/array';
import { Fragment } from 'react';
import { Day } from '../../entities/time';
import { Color } from '../../entities/color';

type Props = { timetable: FullTimetable; style?: ViewStyle; palette: Color[] };

export const Timetable = ({ timetable, style, palette }: Props) => {
  const { timetableViewService } = useServiceContext();
  const [startDay, endDay] = timetableViewService.getDayRange(timetable);
  const [startHour, endHour] = timetableViewService.getHourRange(timetable);
  const times = arrayFromRange(startHour, endHour);
  const days = arrayFromRange(startDay, endDay) as Day[];

  return (
    <View style={{ ...styles.container, ...style }}>
      <View style={styles.dayRow}>
        <View style={styles.dayTimeCell} />
        {days.map((d) => {
          const currentDayClasses = timetable.lecture_list
            .flatMap((l) => l.class_time_json.map((c) => ({ ...c, lesson: l })))
            .filter((c) => c.day === d);
          return (
            <View style={styles.dayCell} key={d}>
              <Text style={styles.labelFont}>{timetableViewService.getDayLabel(d)}</Text>
              {currentDayClasses.map((c) => {
                const { bg, fg } = timetableViewService.getLessonColor(c.lesson, palette);
                return (
                  <View
                    key={c._id}
                    style={{
                      ...styles.classCell,
                      top: DAY_LABEL_HEIGHT + ((c.startMinute - startHour * 60) / 60) * HOUR_HEIGHT,
                      height: ((c.endMinute - c.startMinute) / 60) * HOUR_HEIGHT,
                      backgroundColor: bg,
                    }}
                  >
                    <Text style={{ ...styles.classTitle, color: fg }}>{c.lesson.course_title}</Text>
                    <Text style={{ ...styles.classPlace, color: fg }}>{c.place}</Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
      <View style={styles.timeRows}>
        <View style={styles.timeColumn}>
          {times.map((t) => (
            <View key={t} style={styles.timeCell}>
              <Text style={styles.labelFont}>{t}</Text>
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

const HOUR_HEIGHT = 50;
const DAY_LABEL_HEIGHT = 20;
const HOUR_LABEL_WIDTH = 20;
const DARK_BORDER_COLOR = '#e6e6e6';
const LIGHT_BORDER_COLOR = '#fafafa';
const DARKER_BORDER_COLOR = '#a6a6a6';

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: DARKER_BORDER_COLOR,
    borderLeftColor: DARK_BORDER_COLOR,
  },

  dayRow: {
    display: 'flex',
    flexDirection: 'row',
    height: DAY_LABEL_HEIGHT,
    borderBottomWidth: 2,
    borderColor: DARK_BORDER_COLOR,
    zIndex: 2,
  },
  dayCell: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: DARK_BORDER_COLOR,
    position: 'relative',
  },
  dayTimeCell: {
    height: DAY_LABEL_HEIGHT,
    width: HOUR_LABEL_WIDTH,
    borderRightWidth: 1,
    borderColor: DARK_BORDER_COLOR,
  },
  timeColumn: { width: HOUR_LABEL_WIDTH, borderRightWidth: 1, borderColor: DARK_BORDER_COLOR },
  timeCell: { height: HOUR_HEIGHT, borderBottomWidth: 2, paddingTop: 4, borderColor: DARK_BORDER_COLOR },
  timeRows: { display: 'flex', flexDirection: 'row' },
  timeGridWrapper: { flex: 1 },
  gridRow: { height: HOUR_HEIGHT / 2, display: 'flex', flexDirection: 'row', borderBottomWidth: 2 },
  gridRowFront: { borderColor: LIGHT_BORDER_COLOR },
  gridRowBack: { borderColor: DARK_BORDER_COLOR },
  gridCell: { flex: 1, borderRightWidth: 1, borderColor: DARK_BORDER_COLOR },

  labelFont: { fontSize: 12, textAlign: 'center', color: DARKER_BORDER_COLOR },

  classTitle: { fontSize: 10, fontWeight: '500', textAlign: 'center' },
  classPlace: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  classCell: {
    padding: 4,
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    gap: 4,
    alignItems: 'center',
  },
});
