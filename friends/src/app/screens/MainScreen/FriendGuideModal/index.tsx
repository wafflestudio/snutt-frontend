import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Asset } from '../../../../entities/asset';
import { Carousel } from '../../../components/Carousel';
import { ChevronLeftIcon } from '../../../components/Icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../../components/Icons/ChevronRightIcon';
import { CloseIcon } from '../../../components/Icons/CloseIcon';
import { Modal } from '../../../components/Modal';
import { Paper } from '../../../components/Paper';
import { useServiceContext } from '../../../contexts/ServiceContext';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { useMainScreenContext } from '..';

export const FriendGuideModal = () => {
  const [current, setCurrent] = useState<string>();
  const { assetService } = useServiceContext();
  const { dispatch, isGuideModalOpen } = useMainScreenContext();
  const {
    theme,
    color: {
      input: {
        default: { border },
        placeholder,
      },
    },
  } = useThemeContext();

  const closeGuideModal = () => {
    dispatch({ type: 'setGuideModalOpen', isOpen: false });
    setCurrent(undefined);
  };

  const assets = {
    light: [
      assetService.getAssetUrl(Asset.GUIDE_LIGHT_1),
      assetService.getAssetUrl(Asset.GUIDE_LIGHT_2),
      assetService.getAssetUrl(Asset.GUIDE_LIGHT_3),
      assetService.getAssetUrl(Asset.GUIDE_LIGHT_4),
      assetService.getAssetUrl(Asset.GUIDE_LIGHT_5),
    ],
    dark: [
      assetService.getAssetUrl(Asset.GUIDE_DARK_1),
      assetService.getAssetUrl(Asset.GUIDE_DARK_2),
      assetService.getAssetUrl(Asset.GUIDE_DARK_3),
      assetService.getAssetUrl(Asset.GUIDE_DARK_4),
      assetService.getAssetUrl(Asset.GUIDE_DARK_5),
    ],
  }[theme].map((url) => ({
    key: url,
    item: <Image resizeMode="stretch" style={styles.image} source={{ uri: url }} />,
  }));
  const currentWithDefault = current ?? assets[0]!.key;
  const currentIndex = assets.findIndex((i) => i.key === currentWithDefault);

  const moveCurrent = (dir: 'left' | 'right') => {
    const nextIndex = dir === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= assets.length) return;
    setCurrent(assets[nextIndex]?.key);
  };

  return (
    <Modal isOpen={isGuideModalOpen} onClose={closeGuideModal}>
      <Paper>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={closeGuideModal}>
            <CloseIcon width={30} height={30} style={{ color: border }} />
          </TouchableOpacity>
        </View>
        <View style={styles.modalContent}>
          <View style={styles.moveButtonPlace}>
            {assets.at(0)?.key !== currentWithDefault && (
              <TouchableOpacity onPress={() => moveCurrent('left')}>
                <ChevronLeftIcon width={30} height={30} style={{ color: placeholder }} />
              </TouchableOpacity>
            )}
          </View>
          <Carousel items={assets} gap={0} width={210} current={currentWithDefault} setCurrent={setCurrent} />
          <View style={styles.moveButtonPlace}>
            {assets.at(-1)?.key !== currentWithDefault && (
              <TouchableOpacity onPress={() => moveCurrent('right')}>
                <ChevronRightIcon width={30} height={30} style={{ color: placeholder }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Paper>
    </Modal>
  );
};

const styles = StyleSheet.create({
  image: { width: 210, height: 210 },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingTop: 22,
    paddingHorizontal: 22,
  },
  modalContent: {
    paddingBottom: 36,
    paddingLeft: 14,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveButtonPlace: { width: 30 },
});
