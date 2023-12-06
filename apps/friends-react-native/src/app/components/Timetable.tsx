import { Fragment, memo, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Color } from '../../entities/color';
import { Day } from '../../entities/time';
import { FullTimetable } from '../../entities/timetable';
import { arrayFromRange } from '../../utils/array';
import { useServiceContext } from '../contexts/ServiceContext';
import { useThemeContext } from '../contexts/ThemeContext';
import { Typography } from './Typography';

type Props = { timetable: Pick<FullTimetable, 'lectures'>; style?: ViewStyle; palette: Color[] };

export const Timetable = memo(({ timetable, style, palette }: Props) => {
  const [height, setHeight] = useState(0);
  const { timetableViewService } = useServiceContext();
  const [startDay, endDay] = timetableViewService.getDayRange(timetable);
  const [startHour, endHour] = timetableViewService.getHourRange(timetable);
  const times = arrayFromRange(startHour, endHour);
  const days = arrayFromRange(startDay, endDay) as Day[];
  const hourHeight = (height - DAY_LABEL_HEIGHT) / times.length;
  const { timetableMajor, timetableMinor } = useThemeContext(({ color }) => color.border);

  return (
    <View style={{ ...styles.container, ...style }} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      <View style={[styles.dayRow, { borderColor: timetableMajor }]}>
        <View style={[styles.dayTimeCell, { borderColor: timetableMajor }]} />
        {days.map((d) => {
          const currentDayClasses = timetable.lectures
            .flatMap((l) => l.classPlaceAndTimes.map((c) => ({ ...c, lesson: l })))
            .filter((c) => c.day === d);
          return (
            <View style={[styles.dayCell, { borderColor: timetableMajor }]} key={d}>
              <Typography variant="description" style={styles.labelFont}>
                {timetableViewService.getDayLabel(d)}
              </Typography>
              {currentDayClasses.map((c) => {
                const { bg, fg } = timetableViewService.getLessonColor(c.lesson, palette);
                const place = c.place.trim();
                const top = DAY_LABEL_HEIGHT + ((c.startMinute - startHour * 60) / 60) * hourHeight - 1;
                const cellHeight = ((c.endMinute - c.startMinute) / 60) * hourHeight;

                const classLines = Math.max(Math.ceil((cellHeight - (place ? 16 : 0)) / 12), 0);

                return (
                  <View
                    key={`${c.day} ${c.startMinute} ${c.endMinute}`}
                    style={{ ...styles.classCell, top, height: cellHeight, backgroundColor: bg }}
                  >
                    <Typography numberOfLines={classLines} style={{ ...styles.classTitle, color: fg }}>
                      {c.lesson.courseTitle}
                    </Typography>
                    {place && (
                      <Typography numberOfLines={1} style={{ ...styles.classPlace, color: fg }}>
                        {place}
                      </Typography>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
      <View style={styles.timeRows}>
        <View style={[styles.timeColumn, { borderColor: timetableMajor }]}>
          {times.map((t) => (
            <View key={t} style={{ ...styles.timeCell, height: hourHeight, borderColor: timetableMajor }}>
              <Typography variant="description" style={styles.labelFont}>
                {t}
              </Typography>
            </View>
          ))}
        </View>
        <View style={styles.timeGridWrapper}>
          {arrayFromRange(startHour, endHour).map((time) => {
            return (
              <Fragment key={time}>
                <View style={[styles.gridRow, { borderBottomColor: timetableMinor, height: hourHeight / 2 }]}>
                  {days.map((c) => (
                    <View key={c} style={[styles.gridCell, { borderColor: timetableMajor }]} />
                  ))}
                </View>
                <View style={[styles.gridRow, { borderBottomColor: timetableMajor, height: hourHeight / 2 }]}>
                  {days.map((c) => (
                    <View key={c} style={[styles.gridCell, { borderColor: timetableMajor }]} />
                  ))}
                </View>
              </Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
});

const DAY_LABEL_HEIGHT = 26;
const HOUR_LABEL_WIDTH = 20;

const styles = StyleSheet.create({
  container: {
    marginRight: -1,
    marginBottom: -1,
    flex: 1,
    zIndex: -1,
  },

  dayRow: {
    display: 'flex',
    flexDirection: 'row',
    height: DAY_LABEL_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    zIndex: 2,
  },
  dayCell: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    position: 'relative',
  },
  dayTimeCell: {
    height: DAY_LABEL_HEIGHT,
    width: HOUR_LABEL_WIDTH,
    borderRightWidth: 1,
  },
  timeColumn: { width: HOUR_LABEL_WIDTH, borderRightWidth: 1 },
  timeCell: { borderBottomWidth: 1, paddingTop: 4 },
  timeRows: { display: 'flex', flexDirection: 'row' },
  timeGridWrapper: { flex: 1 },
  gridRow: { display: 'flex', flexDirection: 'row', borderBottomWidth: 1 },
  gridCell: { flex: 1, borderRightWidth: 1 },

  labelFont: { fontSize: 12, textAlign: 'center' },

  classTitle: { fontSize: 11, fontWeight: '500', textAlign: 'center' },
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
