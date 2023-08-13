import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMainScreenContext } from '..';
import { useState } from 'react';
import { ManageFriendsDrawerContentActiveList } from './ManageFriendsDrawerContentActiveList';
import { ManageFriendsDrawerContentRequestedList } from './ManageFriendsDrawerContentRequestedList';

type Tab = 'ACTIVE' | 'REQUESTED';

type Props = {
  onClose: () => void;
};

export const ManageFriendsDrawerContent = ({ onClose }: Props) => {
  const [tab, setTab] = useState<Tab>('ACTIVE');
  const { onSelectFriend } = useMainScreenContext();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>SNUTT</Text>
        <TouchableOpacity onPress={onClose}>
          <Text>X</Text>
        </TouchableOpacity>
      </View>
      <View>
        <View>
          {tabs.map(({ label, value }) => (
            <TouchableOpacity key={value} onPress={() => setTab(value)}>
              <View>
                <Text>{label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View>
          <Text>친구 추가하기 +</Text>
        </View>
        {
          {
            ACTIVE: <ManageFriendsDrawerContentActiveList onClickFriend={onSelectFriend} />,
            REQUESTED: <ManageFriendsDrawerContentRequestedList />,
          }[tab]
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 22.5, paddingHorizontal: 20 },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const tabs: { label: string; value: Tab }[] = [
  { label: '친구 목록', value: 'ACTIVE' },
  { label: '친구 요청', value: 'REQUESTED' },
];
