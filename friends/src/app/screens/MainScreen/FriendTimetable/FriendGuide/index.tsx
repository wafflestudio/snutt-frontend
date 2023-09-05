import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Asset } from '../../../../../entities/asset';
import { Carousel } from '../../../../components/Carousel';
import { EmptyView } from '../../../../components/EmptyView';
import { ChevronLeftIcon } from '../../../../components/Icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../../../components/Icons/ChevronRightIcon';
import { CloseIcon } from '../../../../components/Icons/CloseIcon';
import { HamburgerIcon } from '../../../../components/Icons/HamburgerIcon';
import { QuestionIcon } from '../../../../components/Icons/QuestionIcon';
import { UserPlusIcon } from '../../../../components/Icons/UserPlusIcon';
import { Modal } from '../../../../components/Modal';
import { Paper } from '../../../../components/Paper';
import { Typography } from '../../../../components/Typography';
import { useServiceContext } from '../../../../contexts/ServiceContext';
import { useThemeContext } from '../../../../contexts/ThemeContext';
import { useMainScreenContext } from '../..';

export const FriendGuide = () => {
  const [current, setCurrent] = useState<string>();
  const { assetService } = useServiceContext();
  const { dispatch, isGuideModalOpen } = useMainScreenContext();
  const {
    theme,
    color: {
      text: { caption, hint },
      input: {
        default: { border },
      },
    },
  } = useThemeContext();

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
  const currentWithDefault = current ?? assets[0].key;
  const currentIndex = assets.findIndex((i) => i.key === currentWithDefault);

  const moveCurrent = (dir: 'left' | 'right') => {
    const nextIndex = dir === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex < 0 || nextIndex >= assets.length) return;
    setCurrent(assets[nextIndex].key);
  };
  const openGuideModal = () => dispatch({ type: 'setGuideModalOpen', isOpen: true });
  const closeGuideModal = () => {
    dispatch({ type: 'setGuideModalOpen', isOpen: false });
    setCurrent(undefined);
  };

  return (
    <>
      <Paper style={styles.wrapper}>
        <EmptyView
          size="big"
          title="추가한 친구가 없습니다."
          descriptions={[
            <>
              우측 상단 <UserPlusIcon style={{ color: caption }} width={12} height={12} /> 을 눌러
            </>,
            '시간표를 공유하고 싶은 친구에게 친구 요청을 보내보세요!',
            <>
              친구가 수락하면 사이드바 <HamburgerIcon style={{ color: caption }} width={12} height={12} /> 친구 목록에
              추가됩니다.
            </>,
          ]}
          etc={
            <TouchableOpacity onPress={openGuideModal} style={styles.detailButton}>
              <QuestionIcon style={{ color: hint }} width={12} height={12} />
              <Typography variant="hint" style={styles.hint}>
                자세히 보기
              </Typography>
            </TouchableOpacity>
          }
        />
      </Paper>
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
                  <ChevronLeftIcon width={30} height={30} />
                </TouchableOpacity>
              )}
            </View>
            <Carousel items={assets} gap={0} width={210} current={currentWithDefault} setCurrent={setCurrent} />
            <View style={styles.moveButtonPlace}>
              {assets.at(-1)?.key !== currentWithDefault && (
                <TouchableOpacity onPress={() => moveCurrent('right')}>
                  <ChevronRightIcon width={30} height={30} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Paper>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 },
  image: { width: 210, height: 210 },
  typoMargin4: { paddingTop: 8 },
  detailButton: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 4 },
  hint: { textDecorationLine: 'underline' },

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
