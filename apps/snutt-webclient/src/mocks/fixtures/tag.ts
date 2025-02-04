import { type SnuttApiSuccessResponseData } from '@sf/snutt-api';

export const mockTags: SnuttApiSuccessResponseData<'GET /v1/tags/:year/:semester'> = {
  classification: ['교양', '교직', '논문', '전선', '전필'],
  department: [
    '간호학과',
    '경영학과',
    '경제학부',
    '공기업정책학과',
    '과학교육과',
    '교육학과',
    '국사학과',
    '국어국문학과',
    '국제학과',
    '기초과정',
    '기초교육원',
    '노어노문학과',
    '독어독문학과',
    '동양화과',
    '미학과',
    '바이오시스템공학과',
    '불어불문학과',
    '사범대학',
    '사회교육과',
    '사회학과',
    '생명과학부',
    '서양사학과',
    '서양화과',
    '서어서문학과',
    '수리과학부',
    '심리학과',
    '언어학과',
    '에너지자원공학과',
    '영어영문학과',
    '윤리교육과',
    '의학과',
    '임상간호학과',
    '자유전공학부',
    '전기·정보공학부',
    '정치외교학부',
    '종교학과',
    '중어중문학과',
    '철학과',
    '체육교육과',
    '통계학과',
    '행정학과',
    '혁신공유학부',
    '협동과정  서양고전학전공',
    '협동과정  조경학',
    '협동과정 기술경영·경제·정책전공',
  ],
  academic_year: ['1학년', '2학년', '3학년', '4학년', '박사', '석박사통합', '석사'],
  credit: ['1학점', '2학점', '3학점', '4학점'],
  instructor: [
    'Abigail Joo Young Shin',
    'Andrew Mahaffey Wilbur',
    'Christiaan Prinsloo',
    'Nicholas William Shaw',
    'Otto van Koert',
    'Paul Shepherd',
    'Raymond Salcedo',
    'Takuji Oda',
    '강동균',
    '강상욱',
    '강성식',
    '강성윤',
    '강정원',
    '강창민',
    '강현구',
    '강희경',
    '권준우',
    '금현섭',
    '기계형',
    '김경선',
    '김광식',
    '김남준',
    '김남희',
    '김명환',
    '김민지',
    '김상호',
    '김석호',
    '김선진',
    '김수강',
    '김수미',
    '김수민',
    '김수안',
    '김수영',
    '김승진',
    '김영',
    '김영득',
    '김영미',
    '김예리',
    '김용권',
    '김우찬',
    '김이선',
    '김인우',
    '김재범',
    '김재석',
    '김정아',
    '김정준',
    '김종명',
    '김종영',
    '김종호',
    '김주선',
    '김준서',
    '김지영',
    '김지현',
    '김진영',
    '김학진',
    '김현수',
    '김현주',
    '김형준',
    '김형진',
    '김혜미',
    '김홍기',
    '김효재',
    '김효정',
    '김희은',
    '노연숙',
    '류윤지',
    '류현석',
    '명정',
    '명훈',
    '민지연',
    '민현준',
    '박경선',
    '박경인',
    '박나영',
    '박상은',
    '박성우',
    '박승일',
    '박승진',
    '박영준',
    '박용진',
    '박이택',
    '박정민',
    '박정필',
    '박제철',
    '박지애',
    '박찬우',
    '박현정',
    '박현희',
    '박형동',
    '박형생',
    '배영애',
    '백승현',
    '변해선',
    '서영지',
    '서용준',
    '서유진',
    '서은혜',
    '서혜진',
    '선우경',
    '소영순',
    '손현주',
    '송영근',
    '송영훈',
    '송은지',
    '신현주',
    '신혜연',
    '안지훈',
    '안효연',
    '양철준',
    '양호영',
    '엄석진',
    '오대균',
    '오성주',
    '오희은',
    '유서현',
    '유자도',
    '유종윤',
    '윤석균',
    '윤수진',
    '윤순식',
    '윤정남',
    '윤지현',
    '은기수',
    '응웬트렁',
    '이경호',
    '이군택',
    '이기철',
    '이병수',
    '이병재',
    '이상림',
    '이상혁',
    '이선순',
    '이선영',
    '이수연',
    '이수진',
    '이숙경',
    '이아롱',
    '이연진',
    '이용훈',
    '이우빈',
    '이유선',
    '이윤희',
    '이정원',
    '이정하',
    '이정환',
    '이종택',
    '이주홍',
    '이준엽',
    '이진권',
    '이창선',
    '이태호',
    '이혜진',
    '임부연',
    '임성진',
    '임영운',
    '임재형',
    '임정인',
    '임충훈',
    '장도진',
    '장선주',
    '장성일',
    '장소연',
    '장시은',
    '장재준',
    '장진영',
    '전기화',
    '전예완',
    '정도상',
    '정상윤',
    '정선옥',
    '정유미',
    '정재욱',
    '조애리',
    '조영실',
    '조진호',
    '조한나',
    '조현석',
    '주기평',
    '천상민',
    '최연정',
    '최용주',
    '최유정',
    '최진욱',
    '최형규',
    '최혜린',
    '하상진',
    '한경자',
    '한경희',
    '한윤선',
    '허선영',
    '허윤정',
    '현영종',
    '홍인혜',
    '홍진옥',
    '홍진호',
    '홍현우',
    '황미선',
    '황세희',
    '황수웅',
    '황준석',
    '황지희',
    '황향주',
  ],
  category: [
    '과학적 사고와 실험',
    '대학과 리더쉽',
    '문화와 예술',
    '사고와 표현',
    '수량적 분석과 추론',
    '언어와 문학',
    '역사와 철학',
    '예술실기',
    '외국어',
    '인간과 사회',
    '자연과 기술',
    '정치와 경제',
    '창의와 융합',
    '체육',
    '컴퓨터와 정보 활용',
  ],
  categoryPre2025: [],
  updated_at: 1672231517496,
};
