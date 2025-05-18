import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { CloseIcon } from '../../../components/Icons/CloseIcon';
import { SnuttLogoIcon } from '../../../components/Icons/SnuttLogoIcon';
import { SnuttTextIcon } from '../../../components/Icons/SnuttTextIcon';
import { UserPlusIcon } from '../../../components/Icons/UserPlusIcon';
import { NotificationDot } from '../../../components/NotificationDot';
import { Typography } from '../../../components/Typography';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { useFriends } from '../../../queries/useFriends';
import { useMainScreenContext } from '..';
import { ManageFriendsDrawerContentActiveList } from './ManageFriendsDrawerContentActiveList';
import { ManageFriendsDrawerContentRequestedList } from './ManageFriendsDrawerContentRequestedList';

type Tab = 'ACTIVE' | 'REQUESTED';

type Props = {
  onClose: () => void;
};

export const ManageFriendsDrawerContent = ({ onClose }: Props) => {
  const [tab, setTab] = useState<Tab>('ACTIVE');
  const { dispatch } = useMainScreenContext();
  const addFriendButtonColor = useThemeContext((data) => data.color.button.gray.text);
  const tabActiveBorder = useThemeContext((data) => data.color.tab.active.border);
  const tabActiveText = useThemeContext((data) => data.color.tab.active.text);
  const tabInactiveBorder = useThemeContext((data) => data.color.tab.inactive.border);
  const tabInactiveText = useThemeContext((data) => data.color.tab.inactive.text);
  const dividerColor = useThemeContext((data) => data.color.border.divider);
  const { data: requestedFriends } = useFriends({ state: 'REQUESTED' });
  const isRequestedFriendExist = requestedFriends && requestedFriends.length !== 0;

  useEffect(() => {
    if (isRequestedFriendExist) setTab('REQUESTED');
  }, [isRequestedFriendExist]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SnuttLogoIcon width={20} height={20} />
        <View style={styles.snutt}>
          <SnuttTextIcon width={67} height={21} />
        </View>
        <TouchableOpacity onPress={onClose}>
          <CloseIcon width={30} height={30} />
        </TouchableOpacity>
      </View>
      <View style={{ ...styles.divider, borderColor: dividerColor }} />

      <View style={styles.tabs}>
        {tabs.map(({ label, value }) => {
          const isActive = tab === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => setTab(value)}
              style={{ ...styles.tab, borderBottomColor: isActive ? tabActiveBorder : tabInactiveBorder }}
            >
              <View style={styles.tabTextWrapper}>
                <Typography style={{ ...styles.tabText, color: isActive ? tabActiveText : tabInactiveText }}>
                  {label}
                </Typography>
                {isRequestedFriendExist && value === 'REQUESTED' && <NotificationDot style={styles.dot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.tabContent}>
        <TouchableOpacity
          style={{ ...styles.addFriend, borderBottomColor: dividerColor }}
          onPress={() => dispatch({ type: 'setRequestFriendModalOpen', isOpen: true })}
        >
          <Typography style={{ ...styles.addFriendText, color: addFriendButtonColor }}>친구 추가하기</Typography>
          <UserPlusIcon style={{ color: addFriendButtonColor }} width={16} height={16} />
        </TouchableOpacity>

        {
          {
            ACTIVE: (
              <ManageFriendsDrawerContentActiveList
                onClickFriend={(friendId) => {
                  dispatch({ type: 'setFriend', friendId });
                  onClose();
                }}
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
  container: { paddingVertical: 22, height: '100%', display: 'flex' },
  header: {
    marginHorizontal: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
    gap: 12,
  },
  snutt: { fontSize: 18, fontWeight: '900', flex: 1 },
  divider: { marginTop: 20, marginHorizontal: 8, borderTopWidth: 0.5, marginBottom: 8 },
  tabs: { marginHorizontal: 20, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' },
  tab: {
    height: 38,
    borderBottomWidth: 2,
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabTextWrapper: { position: 'relative' },
  tabText: { textAlign: 'center', fontSize: 16 },
  dot: { position: 'absolute', top: 1, right: -6 },

  tabContent: { paddingTop: 16, flex: 1 },

  addFriend: {
    marginHorizontal: 20,
    paddingLeft: 4,
    paddingRight: 10,
    borderBottomWidth: 0.5,
    paddingBottom: 9,
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addFriendText: { fontSize: 13 },
});

const tabs: { label: string; value: Tab }[] = [
  { label: '친구 목록', value: 'ACTIVE' },
  { label: '친구 요청', value: 'REQUESTED' },
];
