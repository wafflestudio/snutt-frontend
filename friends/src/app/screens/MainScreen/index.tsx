import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppBar } from '../../components/Appbar';
import { FriendTimetable } from './FriendTimetable';

export const MainScreen = () => {
  return (
    <SafeAreaView>
      <AppBar
        title="친구 시간표"
        left={
          <TouchableOpacity onPress={() => Alert.alert('미구현')}>
            <Text>=</Text>
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity onPress={() => Alert.alert('미구현')}>
            <Text>+</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        <FriendTimetable />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ container: { padding: 30 } });
