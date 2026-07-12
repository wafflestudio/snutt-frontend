import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { useGuardContext } from '@/hooks/useGuardContext';

import { Landing } from '../landing';
import { TimetablePickerContent } from './timetable-picker-content';

type Props = {
  token: string | null;
};

export const TimetablePickerPage = ({ token }: Props) => {
  const [searchParams] = useSearchParams();
  const { timetablePickerService } = useGuardContext(ServiceContext);

  const origin = searchParams.get('origin');
  const isOriginAllowed = timetablePickerService.isAllowedOrigin(origin);

  if (!isOriginAllowed) {
    return (
      <ErrorWrapper>
        <ErrorMessage>허용되지 않은 요청입니다</ErrorMessage>
      </ErrorWrapper>
    );
  }

  if (!token) {
    return <Landing />;
  }

  return (
    <TokenAuthContext.Provider value={{ token }}>
      <TimetablePickerContent targetOrigin={origin} />
    </TokenAuthContext.Provider>
  );
};

const ErrorWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: rgb(247, 248, 249);
`;

const ErrorMessage = styled.div`
  font-size: 16px;
  color: rgba(0, 0, 0, 0.87);
  text-align: center;
  padding: 32px;
`;
