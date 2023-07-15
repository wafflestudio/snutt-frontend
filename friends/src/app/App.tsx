import { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useServiceContext } from '../main';
import { Timetable } from '../entities/timetable';

export const App = () => {
  const [data, setData] = useState<Timetable[]>();
  const isDarkMode = useColorScheme() === 'dark';
  const { timetableService } = useServiceContext();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    timetableService.listTimetables().then(setData);
  }, [timetableService]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
      >
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}
        >
          <Text>GET /tables</Text>
          <FlatList
            data={data?.map((d) => ({ key: d._id, title: d.title }))}
            renderItem={({ item }) => <Text>{item.title}</Text>}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
