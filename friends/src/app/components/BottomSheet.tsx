import { PropsWithChildren } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

import { useThemeContext } from '../contexts/ThemeContext';
import { Paper } from './Paper';
import { Typography } from './Typography';

type Props = { isOpen: boolean; onClose: () => void };

export const BottomSheet = ({ isOpen, onClose, children }: PropsWithChildren<Props>) => {
  return (
    <Modal
      isVisible={isOpen}
      onBackdropPress={onClose}
      useNativeDriver
      style={styles.modal}
      hideModalContentWhileAnimating
      avoidKeyboard
    >
      <Paper style={styles.modalContent}>{children}</Paper>
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
  const disabledButtonColor = useThemeContext((data) => data.color.button.text.disabled);

  return (
    <View style={styles.modalHeader}>
      {[left, right].map((item, i) => (
        <View key={i}>
          {item && (
            <TouchableOpacity disabled={item.disabled} onPress={item.onPress}>
              <Typography
                style={{
                  ...styles.modalHeaderText,
                  ...(item.disabled ? { color: disabledButtonColor } : {}),
                }}
              >
                {item.text}
              </Typography>
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
    padding: 20,
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalHeaderText: { fontSize: 14 },
});
