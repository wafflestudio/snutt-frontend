import { type SnuttApiSuccessResponseData } from '@sf/snutt-api';

export const mockBookmarks: SnuttApiSuccessResponseData<'GET /v1/bookmarks'> = {
  year: 2021,
  semester: 1,
  lectures: [
    {
      _id: '6329ab4ecb360c002b6eec57',
      course_title: '관심강의1',
      class_time_json: [],
      class_time_mask: [],
      course_number: 'CS311',
      department: '컴퓨터공학부',
      academic_year: '3학년',
      instructor: '김동현',
      lecture_number: '001',
      credit: 3,
      remark: '비고 Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
    {
      _id: '5d70696c3c46177d58ae23d5',
      course_title: '관심강의2',
      class_time_json: [],
      class_time_mask: [],
      course_number: 'CS311',
      instructor: '김동현',
      lecture_number: '001',
      credit: 3,
    },
  ],
};
