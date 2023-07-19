import { useEffect, useState } from 'react';
import {
  FlatList,
  NativeEventEmitter,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  NativeModules,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useServiceContext } from '../main';
import { BasicTimetable, FullTimetable } from '../entities/timetable';
import { Timetable } from './components/Timetable';
import { Color } from '../entities/color';

const MyEventEmitter = new NativeEventEmitter(NativeModules.MyNativeModule);

export const App = () => {
  const [events, setEvents] = useState<string[]>([]);
  const [table, setTable] = useState<FullTimetable>();
  const [tables, setTables] = useState<BasicTimetable[]>();
  const [palette, setPalette] = useState<Color[]>();
  const isDarkMode = useColorScheme() === 'dark';
  const { timetableService, colorService } = useServiceContext();

  const representativeTableId = tables?.[0]?._id;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    // 이벤트 리스너 등록
    const listener = MyEventEmitter.addListener('MyEvent', (event) => {
      setEvents((prev) => [...prev, JSON.stringify(event)]);
    });

    return () => listener.remove();
  }, []);

  useEffect(() => {
    colorService.getColorPalette().then(setPalette);
  }, [colorService]);

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
      <View>
        <Text>여기 이벤트들 ({events.length}개)</Text>
        <FlatList data={events} renderItem={({ item, index }) => <Text key={index}>{item}</Text>} />
      </View>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}
        >
          <Text>{table?.title}</Text>
          {table && palette && <Timetable timetable={table} style={styles.table} palette={palette} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ table: { margin: 10 } });
