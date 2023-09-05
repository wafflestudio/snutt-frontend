import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import RNModal from 'react-native-modal';

type Props = { isOpen: boolean; onClose: () => void };

export const Modal = ({ isOpen, onClose, children }: PropsWithChildren<Props>) => {
  return (
    <RNModal
      isVisible={isOpen}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      useNativeDriver
      hideModalContentWhileAnimating
    >
      <View style={styles.container}>{children}</View>
    </RNModal>
  );
};

const styles = StyleSheet.create({ container: { justifyContent: 'center', flexDirection: 'row' } });
