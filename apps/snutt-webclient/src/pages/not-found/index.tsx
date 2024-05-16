import { Link } from 'react-router-dom';
import styled from 'styled-components';

import surprisingCat from '@/assets/surprising-cat.png';
import { Button } from '@/components/button';
import { Layout } from '@/components/layout';

export const NotFoundPage = () => {
  return (
    <Layout>
      <Wrapper>
        <CatImage src={surprisingCat} />
        페이지를 찾을 수 없어요
        <Link to="/">
          <Button data-testid="404-return-home" color="blue">
            홈으로
          </Button>
        </Link>
      </Wrapper>
    </Layout>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150px 30px;
  gap: 30px;
`;

const CatImage = styled.img`
  width: 100px;
`;
