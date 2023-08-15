import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import Modal from 'react-native-modal';

type Props = { isOpen: boolean; onClose: () => void };

export const BottomSheet = ({ isOpen, onClose, children }: PropsWithChildren<Props>) => {
  return (
    <Modal
      isVisible={isOpen}
      swipeDirection={['down']}
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      useNativeDriver
      style={styles.modal}
    >
      <View style={styles.modalContent}>{children}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: 'white',
    padding: 20,
  },
});
