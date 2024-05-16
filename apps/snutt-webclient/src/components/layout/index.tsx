import type { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

import { IcLogo } from '@/components/icons/ic-logo';
import { serviceContext } from '@/contexts/ServiceContext';
import { useGuardContext } from '@/hooks/useGuardContext';
import { BREAKPOINT } from '@/styles/constants';

import { LayoutFooter } from './layout-footer';
import { LayoutNotification } from './layout-notification';
import { LayoutProfile } from './layout-profile';

type Props = { headerChildren?: ReactNode };

export const Layout = ({ children, headerChildren }: PropsWithChildren<Props>) => {
  const { feedbackService } = useGuardContext(serviceContext);

  return (
    <div>
      <Header>
        <HeaderInner>
          <HeaderLeft>
            <HomeLink to="/">
              <LogoIcon tabIndex={0} />
              <Title data-testid="logo">SNUTT</Title>
            </HomeLink>
          </HeaderLeft>
          <HeaderMiddle>{headerChildren}</HeaderMiddle>
          <HeaderRight>
            <LayoutNotification />
            <LayoutProfile />
          </HeaderRight>
        </HeaderInner>
      </Header>
      <Main>{children}</Main>
      <LayoutFooter feedbackService={feedbackService} />
    </div>
  );
};

const Header = styled.header`
  height: 120px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 20px;
`;

const crazyRotate = keyframes`
  0% {
    transform: rotate3d(1, 1, 1, 0deg);
  }
  50% {
    transform: rotate3d(1, 1, 1, 360deg);
  }
  100% {
    transform: rotate3d(1, 1, 1, 0deg);
  }
`;

const LogoIcon = styled(IcLogo)`
  &:focus {
    animation: ${crazyRotate} 1s linear infinite;
  }
`;

const HeaderInner = styled.div`
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 100px 1fr 140px;
  gap: 30px;
  align-items: center;

  max-width: ${BREAKPOINT}px;

  @media (max-width: ${BREAKPOINT}px) {
    max-width: 700px;
    grid-template-rows: 30px 1fr;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
`;

const HeaderRight = styled.div`
  grid-column: 3 / 4;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
`;

const HeaderMiddle = styled.div`
  @media (max-width: ${BREAKPOINT}px) {
    max-width: 700px;
    grid-row: 2 / 3;
    grid-column: 1 / 4;
  }
`;

const HomeLink = styled(Link)`
  text-decoration: none;
  display: flex;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 18px;
  margin-left: 8px;
  margin-right: 10px;
  color: black;
  text-size-adjust: 100%;
`;

const Main = styled.main`
  max-width: ${BREAKPOINT}px;
  margin: 0 auto;
`;
