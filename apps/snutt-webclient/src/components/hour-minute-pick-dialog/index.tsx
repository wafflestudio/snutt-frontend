import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { serviceContext } from '@/contexts/ServiceContext';
import type { Hour12, Hour24, HourMinute12, HourMinute24, Minute } from '@/entities/time';
import { useGuardContext } from '@/hooks/useGuardContext';

import { Clock } from '../clock';
import { Dialog } from '../dialog';

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  onSubmit?: (hour: Hour24, minute: Minute) => void;
  defaultHourMinute?: HourMinute24;
  range?: { start: HourMinute24; end: HourMinute24 };
};

enum Step {
  HOUR = 'hour',
  MINUTE = 'minute',
}

export const HourMinutePickDialog = ({ isOpen, onClose, onSubmit, defaultHourMinute, range }: Props) => {
  const [step, setStep] = useState(Step.HOUR);
  const [state, setState] = useState<Partial<HourMinute12>>({});
  const { hourMinutePickerService, errorService } = useGuardContext(serviceContext);

  const { amPm, hour, minute } = state;
  const ampmWithDefault = hourMinutePickerService.getAmPmWithDefault(amPm, defaultHourMinute);
  const hourWithDefault = hourMinutePickerService.getHour12WithDefault(hour, defaultHourMinute);
  const minuteWithDefault = hourMinutePickerService.getMinuteWithDefault(minute, defaultHourMinute);
  const isValid = ampmWithDefault !== undefined && hourWithDefault !== undefined && minuteWithDefault !== undefined;

  const handleClose = () => {
    onClose?.();
    setStep(Step.HOUR);
    setState({});
  };

  const handleSubmit = () => {
    if (!isValid) return;

    const submitHourMinute = hourMinutePickerService.getSubmitHourMinute({ amPm, hour, minute }, { defaultHourMinute });
    if (submitHourMinute === null) return errorService.captureError(new Error('submitHourMinute is null'));

    onSubmit?.(submitHourMinute.hour, submitHourMinute.minute);
    handleClose();
  };

  return (
    <StyledDialog open={isOpen} onClose={handleClose}>
      <Dialog.Title>시간 선택</Dialog.Title>
      <StyledContent data-testid="hour-minute-pick-dialog">
        <TimeWrapper>
          <TypeWrapper>
            {hourMinutePickerService.getAmPmList({}, { range }).map(({ value, label, disabled }) => (
              <TypeBox
                data-testid={`${value}-box`}
                aria-selected={ampmWithDefault === value}
                $selected={ampmWithDefault === value}
                onClick={() =>
                  !disabled &&
                  setState(
                    hourMinutePickerService.getUpdatedStateOnAmPmChange(state, { range, defaultHourMinute }, value),
                  )
                }
                key={value}
                disabled={disabled}
              >
                {label}
              </TypeBox>
            ))}
          </TypeWrapper>
          <TimeBox
            data-testid="hour-box"
            value={hourWithDefault !== undefined ? `${hourWithDefault || 12}`.padStart(2, '0') : '--'}
            $active={step === Step.HOUR}
            onClick={() => setStep(Step.HOUR)}
          />
          :
          <TimeBox
            data-testid="minute-box"
            value={minuteWithDefault !== undefined ? `${minuteWithDefault}`.padStart(2, '0') : '--'}
            $active={step === Step.MINUTE}
            onClick={() => setStep(Step.MINUTE)}
          />
        </TimeWrapper>

        <ClockWrapper $step={step}>
          <TimeClock
            data-testid="hour-clock"
            list={hourMinutePickerService.getHourList({ amPm }, { range, defaultHourMinute })}
            onSelect={(v) => {
              setState(
                hourMinutePickerService.getUpdatedStateOnHourChange(state, { range, defaultHourMinute }, v as Hour12),
              );
              setStep(Step.MINUTE);
            }}
            selected={hourWithDefault}
          />
          <TimeClock
            data-testid="minute-clock"
            list={hourMinutePickerService.getMinuteList({ amPm, hour }, { range, defaultHourMinute })}
            onSelect={(v) => setState({ ...state, minute: v as Minute })}
            selected={minuteWithDefault}
          />
        </ClockWrapper>
      </StyledContent>

      <Dialog.Actions>
        <Button size="small" color="gray" onClick={handleClose} data-testid="time-pick-dialog-cancel">
          취소
        </Button>
        <Button size="small" disabled={!isValid} onClick={handleSubmit} data-testid="time-pick-dialog-submit">
          확인
        </Button>
      </Dialog.Actions>
    </StyledDialog>
  );
};

const StyledDialog = styled(Dialog)`
  width: 300px;
`;

const StyledContent = styled(Dialog.Content)`
  flex: 1;
  width: 100%;
  overflow: hidden;
`;

const TimeWrapper = styled.div`
  display: flex;
  font-size: 42px;
  gap: 6px;
  font-weight: 700;
  align-items: center;
`;

const TypeWrapper = styled.div`
  width: 40px;
  margin-right: 10px;
  height: 80px;
  border: 2px solid #ccc;
  border-radius: 8px;
  flex: 1;
  overflow: hidden;
`;

const TypeBox = styled.button<{ $selected: boolean }>`
  font-size: 14px;
  height: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  color: ${({ $selected }) => ($selected ? '#337972' : '#1f1f1f')};
  background-color: ${({ $selected }) => ($selected ? '#1bd0c930' : '#fff')};
  transition: background-color 0.2s;

  border-color: #ccc;
  border-style: solid;
  box-sizing: border-box;
  border-width: 0px;
  outline: none;
  cursor: pointer;
  font-weight: 700;
  opacity: 1;

  &:not(:first-of-type) {
    border-top-width: 1px;
  }
  &:not(:last-of-type) {
    border-bottom-width: 1px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.2;
  }
`;

const TimeBox = styled.input.attrs({ readOnly: true })<{ $active: boolean }>`
  width: 84px;
  height: 80px;
  text-align: center;
  background-color: ${({ $active }) => ($active ? '#1bd0c930' : '#eee')};
  border-color: ${({ $active }) => ($active ? '#1bd0c9' : 'transparent')};
  color: ${({ $active }) => ($active ? '#337972' : '#1f1f1f')};
  border-width: 2px;
  border-style: solid;
  cursor: pointer;
  border-radius: 8px;
  outline: none;
  font-size: 42px;
  font-weight: 700;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1bd0c930;
  }
`;

const ClockWrapper = styled.div<{ $step: Step }>`
  width: 200%;
  display: flex;
  transform: translateX(${({ $step }) => ($step === Step.MINUTE ? '-50%' : '0%')});
  transition: transform 0.2s;
`;

const TimeClock = styled(Clock)`
  margin: 30px auto 10px;
  flex-shrink: 0;
`;
