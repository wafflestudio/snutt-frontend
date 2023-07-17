import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useServiceContext } from '../main';
import { BasicTimetable, FullTimetable } from '../entities/timetable';
import { Timetable } from './components/Timetable';

export const App = () => {
  const [table, setTable] = useState<FullTimetable>();
  const [tables, setTables] = useState<BasicTimetable[]>();
  const isDarkMode = useColorScheme() === 'dark';
  const { timetableService } = useServiceContext();

  const representativeTableId = tables?.[0]?._id;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    timetableService.listTimetables().then(setTables);
  }, [timetableService]);

  useEffect(() => {
    if (!representativeTableId) return setTable(undefined);
    timetableService.getTimetable(representativeTableId).then(setTable);
  }, [timetableService, representativeTableId]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}
        >
          <Text>{table?.title}</Text>
          {table && <Timetable timetable={table} style={styles.table} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ table: { margin: 10 } });
