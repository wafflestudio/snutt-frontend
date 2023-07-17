import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, useColorScheme, View } from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useServiceContext } from '../main';
import { BasicTimetable, FullTimetable } from '../entities/timetable';
import { Timetable } from './components/Timetable';

export const App = () => {
  const [, setTable] = useState<FullTimetable>();
  const [tables, setTables] = useState<BasicTimetable[]>();
  const isDarkMode = useColorScheme() === 'dark';
  const { timetableService } = useServiceContext();

  const representativeTableId = tables?.[0]?._id;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    timetableService.listTimetables().then(setTables);
  }, [timetableService]);

  useEffect(() => {
    if (!representativeTableId) return setTable(undefined);
    timetableService.getTimetable(representativeTableId).then(setTable);
  }, [timetableService, representativeTableId]);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}
        >
          <Text>{mockTable.title}</Text>
          {mockTable && <Timetable timetable={mockTable} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const mockTable = {
  _id: '5c59377722ac5f0f310df48c',
  user_id: '5c59377722ac5f0f310df48b',
  year: 2019,
  semester: 1,
  title: '18학점',
  lecture_list: [
    {
      _id: '5cb8670735cf723f6f7a858c',
      classification: '교양',
      department: '컴퓨터공학부',
      academic_year: '1학년',
      course_title: '컴퓨터의 개념 및 실습',
      credit: 3,
      class_time: '월(6.5-2)/수(6.5-2)',
      real_class_time: '월(14:30~16:20)/수(14:30~16:20)',
      class_time_json: [
        {
          _id: '5c5434e5fe0abe35a3473748',
          day: 0,
          place: '301-203',
          startMinute: 870,
          endMinute: 980,
          start_time: '14:30',
          end_time: '16:20',
          start: 6.5,
          len: 2,
        },
        {
          _id: '5c5434e5fe0abe35a3473747',
          day: 2,
          place: '301-203',
          startMinute: 870,
          endMinute: 980,
          start_time: '14:30',
          end_time: '16:20',
          start: 6.5,
          len: 2,
        },
      ],
      class_time_mask: [122880, 0, 122880, 0, 0, 0, 0],
      instructor: '김석준',
      quota: 60,
      remark: '®컴퓨터공학부 2019학번 학생만 수강가능',
      category: '컴퓨터와 정보 활용',
      course_number: '035.001',
      lecture_number: '018',
      color: {},
      colorIndex: 8,
      lecture_id: '5cb8670735cf723f6f7a858c',
    },
    {
      _id: '5cb8670635cf723f6f7a8261',
      classification: '교양',
      department: '수리과학부',
      academic_year: '1학년',
      course_title: '수학 1',
      credit: 2,
      class_time: '월(5-1)/수(5-1)',
      real_class_time: '월(13:00~13:50)/수(13:00~13:50)',
      class_time_json: [
        {
          _id: '5c676ec0fa19e84583db6ec5',
          day: 0,
          place: '025-109',
          startMinute: 780,
          endMinute: 830,
          start_time: '13:00',
          end_time: '13:50',
          start: 5,
          len: 1,
        },
        {
          _id: '5c676ec0fa19e84583db6ec4',
          day: 2,
          place: '025-109',
          startMinute: 780,
          endMinute: 830,
          start_time: '13:00',
          end_time: '13:50',
          start: 5,
          len: 1,
        },
      ],
      class_time_mask: [786432, 0, 786432, 0, 0, 0, 0],
      instructor: '김영득',
      quota: 50,
      remark: '초안지는 http://www.math.snu.ac.kr/board/portal 참조',
      category: '수량적 분석과 추론',
      course_number: 'L0442.000100',
      lecture_number: '018',
      color: {},
      colorIndex: 1,
      lecture_id: '5cb8670635cf723f6f7a8261',
    },
    {
      _id: '5cb8670635cf723f6f7a7db0',
      classification: '교양',
      department: '국어국문학과',
      academic_year: '1학년',
      course_title: '대학 글쓰기 1',
      credit: 2,
      class_time: '화(6-1.5)/목(6-1.5)',
      real_class_time: '화(14:00~15:15)/목(14:00~15:15)',
      class_time_json: [
        {
          _id: '5c9441c84a58e371b1b82313',
          day: 1,
          place: '001-210',
          startMinute: 840,
          endMinute: 915,
          start_time: '14:00',
          end_time: '15:15',
          start: 6,
          len: 1.5,
        },
        {
          _id: '5c9441c84a58e371b1b82312',
          day: 3,
          place: '001-210',
          startMinute: 840,
          endMinute: 915,
          start_time: '14:00',
          end_time: '15:15',
          start: 6,
          len: 1.5,
        },
      ],
      class_time_mask: [0, 229376, 0, 229376, 0, 0, 0],
      instructor: '김명운',
      quota: 25,
      remark: '®',
      category: '사고와 표현',
      course_number: 'L0440.000600',
      lecture_number: '065',
      color: {},
      colorIndex: 7,
      lecture_id: '5cb8670635cf723f6f7a7db0',
    },
    {
      _id: '5cb8670635cf723f6f7a7f96',
      classification: '교양',
      department: '영어영문학과',
      academic_year: '1학년',
      course_title: '대학영어 1',
      credit: 2,
      class_time: '월(3-1.5)/수(3-1.5)/금(3-1)',
      real_class_time: '월(11:00~12:15)/수(11:00~12:15)/금(11:00~11:50)',
      class_time_json: [
        {
          _id: '5c9441c84a58e371b1b824fa',
          day: 0,
          place: '002-104-1',
          startMinute: 660,
          endMinute: 735,
          start_time: '11:00',
          end_time: '12:15',
          start: 3,
          len: 1.5,
        },
        {
          _id: '5c9441c84a58e371b1b824f9',
          day: 2,
          place: '002-104-1',
          startMinute: 660,
          endMinute: 735,
          start_time: '11:00',
          end_time: '12:15',
          start: 3,
          len: 1.5,
        },
        {
          _id: '5c9441c84a58e371b1b824f8',
          day: 4,
          place: '002-104-1',
          startMinute: 660,
          endMinute: 710,
          start_time: '11:00',
          end_time: '11:50',
          start: 3,
          len: 1,
        },
      ],
      class_time_mask: [14680064, 0, 14680064, 0, 12582912, 0, 0],
      instructor: '조희연',
      quota: 20,
      remark: 'ⓔ수강기준에 맞지않을시 F("TEPS 및 기초영어·대학영어1·대학영어2·고급영어 이수안내" 반드시 확인후 신청)',
      category: '외국어',
      course_number: '032.017',
      lecture_number: '011',
      color: {},
      colorIndex: 3,
      lecture_id: '5cb8670635cf723f6f7a7f96',
    },
    {
      _id: '5cb8670635cf723f6f7a7e62',
      classification: '교양',
      department: '철학과',
      academic_year: '1학년',
      course_title: '논리와 비판적 사고',
      credit: 3,
      class_time: '금(6-3)',
      real_class_time: '금(14:00~16:50)',
      class_time_json: [
        {
          _id: '5c9441c84a58e371b1b823c4',
          day: 4,
          place: '006-105',
          startMinute: 840,
          endMinute: 1010,
          start_time: '14:00',
          end_time: '16:50',
          start: 6,
          len: 3,
        },
      ],
      class_time_mask: [0, 0, 0, 0, 258048, 0, 0],
      instructor: '이주한',
      quota: 40,
      remark: '',
      category: '사고와 표현',
      course_number: '031.033',
      lecture_number: '001',
      color: {},
      colorIndex: 5,
      lecture_id: '5cb8670635cf723f6f7a7e62',
    },
    {
      _id: '5cb8670635cf723f6f7a82da',
      classification: '교양',
      department: '수리과학부',
      academic_year: '1학년',
      course_title: '수학연습 1',
      credit: 1,
      class_time: '목(7.5-2)',
      real_class_time: '목(15:30~17:20)',
      class_time_json: [
        {
          _id: '5c9441c94a58e371b1b8283c',
          day: 3,
          place: '043-1-302',
          startMinute: 930,
          endMinute: 1040,
          start_time: '15:30',
          end_time: '17:20',
          start: 7.5,
          len: 2,
        },
      ],
      class_time_mask: [0, 0, 0, 30720, 0, 0, 0],
      instructor: '박정필',
      quota: 25,
      remark: '초안지는 http://www.math.snu.ac.kr/board/portal 참조',
      category: '수량적 분석과 추론',
      course_number: 'L0442.000200',
      lecture_number: '053',
      color: {},
      colorIndex: 2,
      lecture_id: '5cb8670635cf723f6f7a82da',
    },
    {
      _id: '5cb8670635cf723f6f7a83b1',
      classification: '교양',
      department: '통계학과',
      academic_year: '1학년',
      course_title: '통계학',
      credit: 3,
      class_time: '화(3-1.5)/목(3-1.5)',
      real_class_time: '화(11:00~12:15)/목(11:00~12:15)',
      class_time_json: [
        {
          _id: '5c9441c94a58e371b1b82914',
          day: 1,
          place: '028-101',
          startMinute: 660,
          endMinute: 735,
          start_time: '11:00',
          end_time: '12:15',
          start: 3,
          len: 1.5,
        },
        {
          _id: '5c9441c94a58e371b1b82913',
          day: 3,
          place: '028-101',
          startMinute: 660,
          endMinute: 735,
          start_time: '11:00',
          end_time: '12:15',
          start: 3,
          len: 1.5,
        },
      ],
      class_time_mask: [0, 14680064, 0, 14680064, 0, 0, 0],
      instructor: '정혜영',
      quota: 70,
      remark:
        '®공대 수강가능, 단, 건축학과생 수강불가 (수강신청 변경기간에는 통계학과생을 제외한 모든 학생 수강신청 가능)',
      category: '수량적 분석과 추론',
      course_number: '033.019',
      lecture_number: '007',
      color: {},
      colorIndex: 6,
      lecture_id: '5cb8670635cf723f6f7a83b1',
    },
    {
      _id: '5ce62274db261b554d559fad',
      course_title: '베이스 과외',
      credit: 0,
      real_class_time: '월(16:30~17:30)',
      class_time_json: [
        {
          _id: '5ce62274db261b554d559fae',
          day: 0,
          place: '두레문예관',
          startMinute: 990,
          endMinute: 1050,
          start_time: '16:30',
          end_time: '17:30',
          start: 8.5,
          len: 1,
        },
      ],
      class_time_mask: [6144, 0, 0, 0, 0, 0, 0],
      instructor: '최성일',
      quota: 0,
      remark: '',
      color: {
        bg: '#E0E0E0',
        fg: '#333333',
      },
      colorIndex: 0,
    },
    {
      _id: '5ce62299db261b554d559fb1',
      course_title: '베이스세미나',
      credit: 0,
      real_class_time: '월(18:00~19:00)',
      class_time_json: [
        {
          _id: '5ce622abdb261b554d559fb5',
          day: 0,
          place: '36동합주실',
          startMinute: 1080,
          endMinute: 1140,
          start_time: '18:00',
          end_time: '19:00',
          start: 10,
          len: 1,
        },
      ],
      class_time_mask: [768, 0, 0, 0, 0, 0, 0],
      instructor: '이성렬',
      quota: 0,
      remark: '',
      color: {
        bg: '#E0E0E0',
        fg: '#333333',
      },
      colorIndex: 0,
    },
    {
      _id: '5ce622d1db261b554d559fbc',
      course_title: '가디언세미나',
      credit: 0,
      real_class_time: '목(18:30~20:00)',
      class_time_json: [
        {
          _id: '5ce622d1db261b554d559fbd',
          day: 3,
          place: '301동203호',
          startMinute: 1110,
          endMinute: 1200,
          start_time: '18:30',
          end_time: '20:00',
          start: 10.5,
          len: 1.5,
        },
      ],
      class_time_mask: [0, 0, 0, 448, 0, 0, 0],
      instructor: '이성찬',
      quota: 0,
      remark: '',
      color: {
        bg: '#E0E0E0',
        fg: '#333333',
      },
      colorIndex: 0,
    },
  ],
  theme: 0,
  updated_at: '2022-04-06T06:18:11.260Z',
} as unknown as FullTimetable;
