import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.modalContent}>{children}</View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const BottomSheetHeader = ({
  left,
  right,
}: {
  left?: { text: string; onPress: () => void; disabled?: boolean };
  right?: { text: string; onPress: () => void; disabled?: boolean };
}) => {
  return (
    <View style={styles.modalHeader}>
      {[left, right].map((item, i) => (
        <View key={i}>
          {item && (
            <TouchableOpacity disabled={item.disabled} onPress={item.onPress}>
              <Text
                // eslint-disable-next-line react-native/no-inline-styles
                style={{
                  ...styles.modalHeaderText,
                  color: !item.disabled ? '#0e0e0e' : '#c4c4c4',
                }}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

BottomSheet.Header = BottomSheetHeader;

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  modalContent: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: 'white',
    padding: 20,
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalHeaderText: { fontSize: 14 },
});
