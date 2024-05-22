import styled, { css } from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { ErrorDialog } from '@/components/error-dialog';
import { IcClock } from '@/components/icons/ic-clock';
import { IcDots } from '@/components/icons/ic-dots';
import { IcLabel } from '@/components/icons/ic-label';
import { IcMap } from '@/components/icons/ic-map';
import { mainLectureListitemPresenter } from '@/pages/main/main-lecture-section/common/main-lecture-listitem/index.presenter';
import { classNames } from '@/utils/classNames';

import styles from './index.module.css';

export const MainLectureListitem = ({
  props,
}: {
  props: Parameters<(typeof mainLectureListitemPresenter)['useViewModel']>[0];
}) => {
  const vm = mainLectureListitemPresenter.useViewModel(props);

  return (
    <div
      className={classNames(styles.wrapper, vm.wrapper.isClickableStyle && styles.clickable)}
      onMouseEnter={vm.wrapper.onMouseEnter}
      onMouseLeave={vm.wrapper.onMouseLeave}
      onClick={vm.wrapper.onClick}
    >
      <div>
        <div className={styles.header}>
          <div className={styles.title}>{vm.header.title}</div>
          <div className={styles.description}>{vm.header.description}</div>
          <div className={styles.bookmarkWrapper}>
            {vm.header.bookmark.isShow && (
              <button onClick={vm.header.bookmark.onClick}>{vm.header.bookmark.icon}</button>
            )}
          </div>
          {vm.header.button.isShow && (
            <button className={styles.cta} style={{ color: vm.header.button.color }} onClick={vm.header.button.onClick}>
              {vm.header.button.text}
            </button>
          )}
        </div>
        <div className={styles.detail}>
          <div className={styles.detailContent}>
            {vm.content.detail.map((detail) => (
              <div key={detail.icon} className={styles.detailItem}>
                {detail.icon === 'label' && <LabelIcon />}
                {detail.icon === 'clock' && <ClockIcon />}
                {detail.icon === 'map' && <MapIcon />}
                <span>{detail.text}</span>
              </div>
            ))}
          </div>
          <div className={styles.detailRight}>
            {vm.content.link.isShow && (
              <a
                className={styles.link}
                onClick={(e) => e.stopPropagation()}
                href={vm.content.link.href}
                target="_blank"
              >
                {vm.content.link.text}
              </a>
            )}
          </div>
        </div>
      </div>
      {vm.remark.isShow && (
        <div className={styles.remark}>
          <DotsIcon />
          <div>{vm.remark.text}</div>
        </div>
      )}
      <div className={styles.divider} />

      <StyledDialog open={vm.deleteDialog.isOpen} onClose={vm.deleteDialog.onClose}>
        <Dialog.Title>{vm.deleteDialog.title}</Dialog.Title>

        <Dialog.Actions>
          <Button color="red" size="small" data-testid="ml-lecture-delete-submit" onClick={vm.deleteDialog.onConfirm}>
            확인
          </Button>
        </Dialog.Actions>
      </StyledDialog>

      <ErrorDialog isOpen={vm.errorDialog.isOpen} onClose={vm.errorDialog.onClose} message={vm.errorDialog.message} />
    </div>
  );
};

const StyledDialog = styled(Dialog)`
  height: 100px;
`;

const iconStyle = css`
  margin-right: 10px;
  min-width: 14px;
  margin-top: 1px;
`;

const LabelIcon = styled(IcLabel).attrs({ width: 14, height: 14 })`
  ${iconStyle}
`;

const ClockIcon = styled(IcClock).attrs({ width: 14, height: 14 })`
  ${iconStyle}
`;

const MapIcon = styled(IcMap).attrs({ width: 14, height: 14 })`
  ${iconStyle}
`;

const DotsIcon = styled(IcDots).attrs({ width: 14, height: 14 })`
  ${iconStyle}
`;
