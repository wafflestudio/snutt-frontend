import { ReactElement, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

type Props = {
  items: { key: string; item: ReactElement }[];
  width: number;
  gap: number;
  height: number;
};

export const Carousel = ({ items, gap, width, height }: Props) => {
  const [current, setCurrent] = useState<string>();

  const itemWidth = width - gap;
  const currentWithDefault = current ?? items[0].key;

  const onScroll = (e: any) => {
    const newPage = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrent(items[newPage].key);
  };

  return (
    <View style={{ width: width, height }}>
      <FlatList
        automaticallyAdjustContentInsets={false}
        data={items}
        decelerationRate="fast"
        horizontal
        keyExtractor={(item) => item.key}
        pagingEnabled
        renderItem={({ item }) => <View style={{ width: itemWidth, marginHorizontal: gap / 2 }}>{item.item}</View>}
        snapToAlignment="start"
        snapToInterval={width}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
      />
      <View style={styles.dots}>
        {items.map((i) => (
          <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{ ...styles.dot, backgroundColor: currentWithDefault === i.key ? '#000' : '#777' }}
            key={i.key}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dots: { display: 'flex', flexDirection: 'row', gap: 20, justifyContent: 'center', marginTop: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
