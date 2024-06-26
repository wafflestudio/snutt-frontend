import { type SnuttApiSuccessResponseData } from '@sf/snutt-api';

export const mockNotification: SnuttApiSuccessResponseData<'GET /v1/notification'> = [
  {
    _id: '1',
    message: '2022년도 겨울학기 수강편람이 추가되었습니다.',
    created_at: '2022-10-18T01:40:37.259Z',
    type: 0,
    title: '',
  },
  {
    _id: '2',
    title: '',
    message: '당첨자분들은 SNU 이메일을 확인해 주세요',
    created_at: '2022-09-19T13:41:19.024Z',
    type: 1,
  },
  {
    _id: '3',
    title: '',
    message: '2022년도 2학기 수강편람이 추가되었습니다.',
    created_at: '2022-07-04T01:40:18.566Z',
    type: 2,
  },
  {
    _id: '4',
    title: '',
    message: '새롭게 추가된 강의평 탭에 솔직한 강의평을 작성해주세요!',
    created_at: '2022-06-21T14:46:57.394Z',
    type: 3,
  },
  {
    _id: '5',
    title: '',
    message: '2022년 5월 7일부터 SNUTT 약관이 개정될 예정입니다.',
    created_at: '2022-04-30T08:34:53.894Z',
    type: 4,
  },
  {
    _id: '6',
    title: '',
    message:
      '개정 사항은 설정>서비스약관 에서 보실 수 있습니다. 문의와 이의제기는 snutt@wafflestudio.com로 접수해 주시기 바랍니다.',
    created_at: '2022-04-30T08:34:45.882Z',
    type: 5,
  },
  {
    _id: '7',
    title: '',
    message: '2022년도 여름학기 수강편람이 추가되었습니다.',
    created_at: '2022-04-18T01:40:18.139Z',
    type: 6,
  },
  {
    _id: '8',
    title: '',
    message: '2022년도 1학기 수강편람이 추가되었습니다.',
    created_at: '2022-01-03T01:40:15.085Z',
    type: 1,
  },
  {
    _id: '9',
    user_id: '5c59377722ac5f0f310df48b',
    message: "2021-W '템프' 시간표의 '수학 1' 강의가 업데이트 되었습니다. (항목: 비고)",
    created_at: '2021-12-31T12:00:31.406Z',
    type: 2,
    title: '',
  },
  {
    _id: '10',
    user_id: '5c59377722ac5f0f310df48b',
    message: "2021-W '템프' 시간표의 '수학 1' 강의가 업데이트 되었습니다. (항목: 비고)",
    created_at: '2021-12-31T12:00:31.180Z',
    type: 2,
    title: '',
  },
];
