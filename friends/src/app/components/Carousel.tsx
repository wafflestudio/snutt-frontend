import { ReactElement, useEffect, useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';

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
  const itemWidth = width - gap;
  const lastVelocity = useLastScrollVelocity();

  const onScrollEnd = (offsetX: number) => {
    if (!isScrolling) return;

    const newPage = Math.round((offsetX + lastVelocity.getLastVelocityPixelPerMillis() * 100) / width); // 현재 속도대로 0.1초 더 스크롤했다 치고
    setIsScrolling(false);
    setCurrent(items.at(newPage)?.key);
    lastVelocity.onScrollEnd();
  };

  useEffect(() => {
    if (isScrolling) return;
    listRef.current?.scrollToOffset({ offset: width * items.findIndex((i) => i.key === current), animated: true });
  }, [current, items, width, isScrolling]);

  return (
    <View style={{ width }}>
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
        onScroll={lastVelocity.onScroll}
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

const useLastScrollVelocity = () => {
  const positionRef = useRef<{ position: number; timestamp: number }[]>([]);

  return {
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      positionRef.current = [
        { position: e.nativeEvent.contentOffset.x, timestamp: new Date().getTime() },
        ...positionRef.current,
      ].slice(0, 2);
    },
    onScrollEnd: () => (positionRef.current = []),
    getLastVelocityPixelPerMillis: () => {
      const [first, second] = positionRef.current;
      if (!first || !second) return 0;
      return (first.position - second.position) / (first.timestamp - second.timestamp);
    },
  };
};
