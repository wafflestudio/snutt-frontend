import { Image, StyleSheet } from 'react-native';

import { Carousel } from '../../../../components/Carousel';
import { Paper } from '../../../../components/Paper';
import benz from './benz.png';
import bmw from './bmw.png';

export const FriendGuide = () => {
  return (
    <Paper style={styles.wrapper}>
      <Carousel
        items={[
          { key: '1', item: <Image style={styles.image} source={bmw} /> },
          { key: '2', item: <Image style={styles.image} source={benz} /> },
        ]}
        gap={100}
        width={300}
        height={300}
      />
    </Paper>
  );
};

const styles = StyleSheet.create({
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 },
  image: { width: 200, height: 200 },
});
