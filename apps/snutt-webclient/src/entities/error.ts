export type CoreServerError = { errcode: number; message: string; ext: unknown; displayMessage?: string };

export type ErrorTable = Record<number, string>;

const errors = [
  { code: 0, message: '서버 측의 오류입니다.' },
  { code: 4097, message: 'FB ID 혹은 FB TOKEN이 주어지지 않았습니다.' },
  { code: 4098, message: '연도 혹은 학기가 주어지지 않았습니다.' },
  {
    code: 4099,
    message: '연도, 학기, 혹은 Timetable 이름이 주어지지 않았습니다.',
  },
  { code: 4100, message: '강의 객체가 주어지지 않았습니다.' },
  { code: 4101, message: '강의 객체에 id 속성이 없습니다.' },
  {
    code: 4102,
    message: 'Course number 혹은 lecture number는 수정할 수 없습니다.',
  },
  { code: 4103, message: 'Timetable 이름이 주어지지 않았습니다.' },
  { code: 4104, message: 'Registration ID가 주어지지 않았습니다.' },
  { code: 4105, message: 'Timemask가 json과 맞지 않거나 올바르지 않습니다.' },
  {
    code: 4106,
    message: 'Color 문자열이 올바른 hex 색상이 아닙니다. 올바른 색상 "#FFFFFF"',
  },
  { code: 4107, message: '강의명을 입력해주세요' },
  { code: 8192, message: 'APIkey가 올바르지 않습니다.' },
  {
    code: 8193,
    message: '로그인이 필요하지만 user token이 주어지지 않았습니다.',
  },
  { code: 8194, message: '잘못된 user token입니다.' },
  { code: 8195, message: 'Admin 권한이 없습니다.' },
  { code: 8196, message: '찾을 수 없는 ID입니다.' },
  { code: 8197, message: '잘못된 password입니다.' },
  { code: 8198, message: '잘못된 페이스북 token입니다.' },
  { code: 8199, message: '(deprecated) 알 수 없는 app입니다.' },
  { code: 8201, message: '비밀번호 재설정을 다시 시도해주세요.' },
  { code: 8208, message: '만료된 인증코드입니다.' },
  { code: 8209, message: '잘못된 인증코드입니다.' },
  { code: 12288, message: '조건에 맞지 않는 ID입니다. (api 설명 참조)' },
  { code: 12289, message: '조건에 맞지 않는 password입니다. (api 설명 참조)' },
  { code: 12290, message: '이미 해당 ID가 존재합니다.' },
  { code: 12291, message: '이미 해당 이름의 타임테이블이 존재합니다.' },
  {
    code: 12292,
    message: '이미 해당 course number와 lecture number의 강의가 존재합니다.',
  },
  { code: 12293, message: '이미 ID와 password가 등록되어 있습니다.' },
  { code: 12294, message: '이미 연결된 페이스북 계정이 있습니다.' },
  { code: 12295, message: '등록된 ID와 password가 없습니다.' },
  { code: 12296, message: '연결된 페이스북 계정이 없습니다.' },
  { code: 12297, message: '이 FB ID는 다른 계정에 연결되어 있습니다.' },
  { code: 12298, message: '강의와 timetable의 학기가 맞지 않습니다.' },
  { code: 12299, message: '강의가 custom lecture가 아닙니다.' },
  { code: 12300, message: '강의 시간이 서로 겹칩니다.' },
  { code: 12301, message: '강의가 custom lecture입니다.' },
  { code: 12302, message: '유저에게 등록된 fcm key가 없습니다.' },
  { code: 12303, message: '올바른 이메일을 입력해주세요.' },
  { code: 16384, message: 'Tag를 찾을 수 없습니다.' },
  { code: 16385, message: 'Timetable을 찾을 수 없습니다.' },
  { code: 16386, message: 'Lecture를 찾을 수 없습니다.' },
  { code: 16387, message: '편람 상의 lecture를 찾을 수 없습니다.' },
  { code: 16388, message: '유저를 찾을 수 없습니다' },
  { code: 16389, message: '서버에서 색깔 테마를 찾을 수 없습니다' },
  { code: 16390, message: '등록된 이메일이 없습니다' },
];

export const getErrorMessage = ({ errcode, displayMessage }: { errcode: number; displayMessage?: string }): string => {
  if (displayMessage) return displayMessage;

  const matchingError = errors.find((e) => e.code === errcode);
  return matchingError ? matchingError.message : '오류가 발생했습니다';
};
