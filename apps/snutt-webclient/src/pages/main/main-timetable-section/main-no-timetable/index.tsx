import styled from 'styled-components';

import { Button } from '@/components/button';

type Props = {
  className?: string;
  onClickCreate: () => void;
};

export const MainNoTimetable = ({ onClickCreate, ...props }: Props) => {
  return (
    <Wrapper {...props}>
      <Text>시간표를 추가해주세요</Text>
      <Button data-testid="mt-empty-create-timetable" onClick={onClickCreate}>
        추가하기
      </Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Text = styled.h2`
  opacity: 0.4;
`;
