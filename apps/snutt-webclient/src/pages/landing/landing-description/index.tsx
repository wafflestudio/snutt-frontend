import styled from 'styled-components';

import { LayoutFooter } from '@/components/layout/layout-footer';
import { type FeedbackService } from '@/usecases/feedbackService';

type Props = { className?: string; feedbackService: FeedbackService };

export const LandingDescription = ({ className, feedbackService }: Props) => {
  return (
    <Wrapper className={className}>
      <HeadSection>
        <Logo src="/logo.png" />
        <h1>SNUTT: 서울대학교 시간표</h1>
        <DownloadWrapper>
          <DownloadLink
            target="_blank"
            href="https://play.google.com/store/apps/details?id=com.wafflestudio.snutt2.live&hl=ko&gl=US&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
          >
            <DownloadImage
              alt="다운로드하기 Google Play"
              src="https://play.google.com/intl/en_us/badges/static/images/badges/ko_badge_web_generic.png"
            />
          </DownloadLink>
          <DownloadLink
            target="_blank"
            href="https://apps.apple.com/us/app/snutt-%EC%84%9C%EC%9A%B8%EB%8C%80%ED%95%99%EA%B5%90-%EC%8B%9C%EA%B0%84%ED%91%9C-%EC%95%B1/id1215668309?itsct=apps_box_badge&amp;itscg=30200"
          >
            <DownloadImage
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/ko-kr?size=250x83&amp;releaseDate=1511049600"
              alt="Download on the App Store"
            />
          </DownloadLink>
        </DownloadWrapper>
      </HeadSection>

      <LayoutFooter feedbackService={feedbackService} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: #ffffff;
`;

const HeadSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Logo = styled.img`
  width: 160px;
`;

const DownloadWrapper = styled.div`
  display: flex;
  gap: 20px;
  height: 80px;
`;

const DownloadLink = styled.a`
  width: 200px;
  display: flex;
  align-items: center;
`;

const DownloadImage = styled.img`
  width: 100%;
`;
