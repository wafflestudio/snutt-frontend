import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMainScreenContext } from '..';
import { useState } from 'react';
import { ManageFriendsDrawerContentActiveList } from './ManageFriendsDrawerContentActiveList';
import { ManageFriendsDrawerContentRequestedList } from './ManageFriendsDrawerContentRequestedList';
import { CloseIcon } from '../../../components/Icons/CloseIcon';
import { SnuttLogoIcon } from '../../../components/Icons/SnuttLogoIcon';

type Tab = 'ACTIVE' | 'REQUESTED';

type Props = {
  onClose: () => void;
};

export const ManageFriendsDrawerContent = ({ onClose }: Props) => {
  const [tab, setTab] = useState<Tab>('ACTIVE');
  const { dispatch } = useMainScreenContext();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SnuttLogoIcon width={20} height={20} />
        <Text style={styles.snutt}>SNUTT</Text>
        <TouchableOpacity onPress={onClose}>
          <CloseIcon width={30} height={30} />
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />

      <View style={styles.tabs}>
        {tabs.map(({ label, value }) => {
          const isActive = tab === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => setTab(value)}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{ ...styles.tab, borderBottomColor: isActive ? '#b3b3b3' : '#f2f2f2' }}
            >
              <Text style={styles.tabText}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.tabContent}>
        <TouchableOpacity style={styles.addFriend}>
          <Text style={styles.addFriendText}>친구 추가하기 +</Text>
        </TouchableOpacity>

        {
          {
            ACTIVE: (
              <ManageFriendsDrawerContentActiveList
                onClickFriend={(friendId) => dispatch({ type: 'setFriend', friendId })}
              />
            ),
            REQUESTED: <ManageFriendsDrawerContentRequestedList />,
          }[tab]
        }
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 22, paddingHorizontal: 20 },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
    gap: 12,
  },
  snutt: { color: '#000', fontSize: 18, fontWeight: '900', flex: 1 },
  divider: { marginTop: 20, height: 1, marginBottom: 16, backgroundColor: '#f2f2f2' },
  tabs: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
  tab: { height: 40, borderBottomWidth: 3, width: '50%', display: 'flex', justifyContent: 'center' },
  tabText: { textAlign: 'center', fontSize: 16 },
  tabContent: { paddingLeft: 15, paddingRight: 15, paddingTop: 16 },

  addFriend: { borderBottomColor: '#f2f2f2', borderBottomWidth: 2, paddingBottom: 9, marginBottom: 8 },
  addFriendText: { color: '#777', fontSize: 12 },
});

const tabs: { label: string; value: Tab }[] = [
  { label: '친구 목록', value: 'ACTIVE' },
  { label: '친구 요청', value: 'REQUESTED' },
];
