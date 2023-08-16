import { Image, StyleSheet, View } from 'react-native';
import { Carousel } from '../../../../components/Carousel';

import bmw from './bmw.png';
import benz from './benz.png';

export const FriendGuide = () => {
  return (
    <View style={styles.wrapper}>
      <Carousel
        items={[
          { key: '1', item: <Image style={styles.image} source={bmw} /> },
          { key: '2', item: <Image style={styles.image} source={benz} /> },
        ]}
        gap={100}
        width={300}
        height={300}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: '#fff' },
  image: { width: 200, height: 200 },
});
