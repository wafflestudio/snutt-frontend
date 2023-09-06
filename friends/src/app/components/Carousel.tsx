import { ReactElement, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Typography } from './Typography';

type Props<K extends string> = {
  current: K;
  setCurrent: (key: K | undefined) => void;
  items: { key: K; item: ReactElement }[];
  width: number;
  gap: number;
};

export const Carousel = <K extends string>({ items, gap, width, current, setCurrent }: Props<K>) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const listRef = useRef<FlatList>(null);
  const velocityX = useRef<number | null>(null);
  const itemWidth = width - gap;
  const [dlx, setDLX] = useState<string>('');

  const onScrollEnd = (offsetX: number) => {
    if (!isScrolling) return;
    const lastVelocityX = velocityX.current ?? 0;

    const newPage = Math.round((offsetX + lastVelocityX * 2) / width);
    setDLX(`${velocityX.current} - ${newPage}`);
    setIsScrolling(false);
    setCurrent(items.at(newPage)?.key);
    velocityX.current = null;
  };

  useEffect(() => {
    if (isScrolling) return;
    listRef.current?.scrollToOffset({ offset: width * items.findIndex((i) => i.key === current), animated: true });
  }, [current, items, width, isScrolling]);

  return (
    <View style={{ width }}>
      <Typography>{dlx}</Typography>
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
        onScrollBeginDrag={() => setIsScrolling(true)}
        onScroll={(e) => (velocityX.current = e.nativeEvent.velocity?.x ?? null)}
        onScrollEndDrag={(e) => onScrollEnd(e.nativeEvent.contentOffset.x)}
        ref={listRef}
      />
      <View style={styles.dots}>
        {items.map((i) => (
          <View
            // eslint-disable-next-line react-native/no-inline-styles
            style={{ ...styles.dot, backgroundColor: current === i.key ? '#000' : '#777' }}
            key={i.key}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dots: { display: 'flex', flexDirection: 'row', gap: 5, justifyContent: 'center', marginTop: 18 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
