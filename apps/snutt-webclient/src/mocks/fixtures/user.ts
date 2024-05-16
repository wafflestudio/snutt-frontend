export const mockUsers = [
  {
    info: {
      isAdmin: false,
      regDate: '2019-02-05T07:12:55.970Z',
      notificationCheckedAt: '2022-12-28T10:51:17.530Z',
      email: 'woohm402@snu.ac.kr',
      local_id: 'woohm402',
      fb_name: null,
    },
    auth: { password: '1234', token: 't1' },
  },

  // 페이스북 유저
  {
    info: {
      isAdmin: false,
      regDate: '2019-02-05T07:12:55.970Z',
      notificationCheckedAt: '2022-12-28T10:51:17.530Z',
      email: 'dkwanm1@snu.ac.kr',
      local_id: null,
      fb_name: '김기완',
    },
    auth: { password: '1234', token: 't2' },
  },

  // 이메일 없는 유저
  {
    info: {
      isAdmin: false,
      regDate: '2019-02-05T07:12:55.970Z',
      notificationCheckedAt: '2022-12-28T10:51:17.530Z',
      local_id: 'noemail',
      fb_name: null,
    },
    auth: { password: 'test-password', token: 't4' },
  },

  // 임시 유저
  {
    info: {
      isAdmin: false,
      regDate: '2019-02-05T07:12:55.970Z',
      notificationCheckedAt: '2022-12-28T10:51:17.530Z',
      local_id: null,
      fb_name: null,
    },
    auth: { password: 'test-password', token: 't3' },
  },

  // 로컬 로그인, 페이스북 연동 유저
  {
    info: {
      isAdmin: false,
      regDate: '2019-02-05T07:12:55.970Z',
      notificationCheckedAt: '2022-12-28T10:51:17.530Z',
      email: 'woohm502@snu.ac.kr',
      local_id: 'woohm502',
      fb_name: '우현민',
    },
    auth: { password: '1234', token: 't5' },
  },
];
