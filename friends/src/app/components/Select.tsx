import { useReducer } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { COLORS } from '../styles/colors';
import { ChevronDownIcon } from './Icons/ChevronDownIcon';
import { Paper } from './Paper';
import { Typography } from './Typography';

type Props<T extends string> = {
  value: T | undefined;
  onChange: (value: T) => void;
  items: { value: T; label: string }[] | undefined;
  style?: { width?: number };
};

export const Select = <T extends string>({ value, onChange, items = [], style = { width: 100 } }: Props<T>) => {
  const [isOpen, toggleOpen] = useReducer((o) => !o, false);
  const selected = items.find((it) => it.value === value);

  return (
    <View style={{ ...styles.container, width: style.width }}>
      <Paper style={styles.dropdown}>
        <TouchableOpacity style={styles.item} onPress={toggleOpen}>
          <Typography style={styles.label} variant="selectLabel">
            {selected?.label}
          </Typography>
          <ChevronDownIcon variant="selectLabel" width={20} height={20} />
        </TouchableOpacity>

        <ScrollView style={styles.scroll}>
          {isOpen &&
            items.map((it) => (
              <TouchableOpacity
                style={styles.item}
                key={it.value}
                onPress={() => {
                  onChange(it.value);
                  toggleOpen();
                }}
              >
                <Typography style={styles.label} variant="selectLabel">
                  {it.label}
                </Typography>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </Paper>
    </View>
  );
};

const ITEM_HEIGHT = 28;

const styles = StyleSheet.create({
  container: { position: 'relative', height: ITEM_HEIGHT },
  dropdown: { position: 'absolute', borderRadius: 4, borderWidth: 1, borderColor: COLORS.gray30, width: '100%' },
  scroll: { maxHeight: 300 },
  item: {
    height: ITEM_HEIGHT,
    paddingLeft: 10,
    paddingRight: 5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  label: { fontSize: 12 },
});
