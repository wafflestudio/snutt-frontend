import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';

import { Button } from '@/components/button';
import { Dialog } from '@/components/dialog';
import { ServiceContext } from '@/contexts/ServiceContext';
import { TokenAuthContext } from '@/contexts/TokenAuthContext';
import { YearSemesterContext } from '@/contexts/YearSemesterContext';
import { useGuardContext } from '@/hooks/useGuardContext';

import type { SearchForm } from '..';
import { MainSearchbarFilterTimeSelectDialog } from './main-searchbar-filter-time-select-dialog';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onReset: null | (() => void);
  searchForm: SearchForm;
  onChangeCheckbox: <F extends 'academicYear' | 'category' | 'classification' | 'credit' | 'department' | 'etc'>(
    field: F,
    e: SearchForm[F][number],
  ) => void;
  onChangeTimeRadio: (value: 'auto' | 'manual' | null) => void;
  onChangeDepartment: (value: string[]) => void;
  onChangeBitMask: (bm: number[]) => void;
};

export const MainSearchbarFilterDialog = ({
  open,
  onClose,
  onSubmit,
  onReset,
  searchForm,
  onChangeCheckbox,
  onChangeTimeRadio,
  onChangeBitMask,
  onChangeDepartment,
}: Props) => {
  const [isTimeModalOpen, setTimeModalOpen] = useState(false);
  const { data } = useSearchFilterTags();

  const tags = data?.type === 'success' ? data.data : undefined;

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialog.Title style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        상세조건 설정
        <Button
          data-testid="main-searchbar-filter-dialog-reset"
          color="gray"
          onClick={onReset ?? undefined}
          disabled={onReset === null}
        >
          초기화
        </Button>
      </StyledDialog.Title>

      <StyledContent>
        <form>
          <Row>
            <RowLabel>학과명 선택</RowLabel>
            <RowContent>
              <label>
                <DepartmentInput
                  list="department"
                  value={searchForm.department}
                  onChange={(e) => onChangeDepartment([e.target.value])}
                />
                <datalist id="department">{tags?.department.map((d) => <option value={d} key={d} />)}</datalist>
              </label>
            </RowContent>
          </Row>
          <Row>
            <RowLabel>학년</RowLabel>
            <RowContent>
              {tags?.academicYear.map((y) => (
                <Checkbox field="academicYear" key={y} value={y} searchForm={searchForm} onChange={onChangeCheckbox} />
              ))}
            </RowContent>
          </Row>
          <Row>
            <RowLabel>학점</RowLabel>
            <RowContent>
              {tags?.credit.map((c) => (
                <Checkbox
                  field="credit"
                  key={c}
                  label={c}
                  value={Number(c.replace('학점', ''))}
                  searchForm={searchForm}
                  onChange={onChangeCheckbox}
                />
              ))}
            </RowContent>
          </Row>
          <Row>
            <RowLabel>구분</RowLabel>
            <RowContent>
              {tags?.classification.map((c) => (
                <Checkbox
                  field="classification"
                  key={c}
                  value={c}
                  searchForm={searchForm}
                  onChange={onChangeCheckbox}
                />
              ))}
            </RowContent>
          </Row>
          <Row>
            <RowLabel>학문의 기초</RowLabel>
            <RowContent>
              {tags?.category
                .filter((c) =>
                  ['사고와 표현', '외국어', '수량적 분석과 추론', '과학적 사고와 실험', '컴퓨터와 정보 활용'].includes(
                    c,
                  ),
                )
                .map((c) => (
                  <Checkbox field="category" key={c} value={c} searchForm={searchForm} onChange={onChangeCheckbox} />
                ))}
            </RowContent>
          </Row>
          <Row>
            <RowLabel>학문의 세계</RowLabel>
            <RowContent>
              {tags?.category
                .filter((c) =>
                  [
                    '언어와 문학',
                    '문화와 예술',
                    '역사와 철학',
                    '정치와 경제',
                    '인간과 사회',
                    '자연과 기술',
                    '생명과 환경',
                  ].includes(c),
                )
                .map((c) => (
                  <Checkbox field="category" key={c} value={c} searchForm={searchForm} onChange={onChangeCheckbox} />
                ))}
            </RowContent>
          </Row>
          <Row>
            <RowLabel>선택 교양</RowLabel>
            <RowContent>
              {tags?.category
                .filter((c) => ['체육', '예술실기', '대학과 리더십', '창의와 융합', '한국의 이해'].includes(c))
                .map((c) => (
                  <Checkbox field="category" key={c} value={c} searchForm={searchForm} onChange={onChangeCheckbox} />
                ))}
            </RowContent>
          </Row>
          <Row>
            <RowLabel>기타</RowLabel>
            <RowContent>
              <Checkbox
                field="etc"
                label="영어진행 강의"
                value="E"
                searchForm={searchForm}
                onChange={onChangeCheckbox}
              />
              <Checkbox
                field="etc"
                label="군휴학 원격수업"
                value="MO"
                searchForm={searchForm}
                onChange={onChangeCheckbox}
              />
            </RowContent>
          </Row>
          <Row>
            <RowLabel>시간대 검색</RowLabel>
            <RowContent>
              <label>
                시간대 검색
                <input
                  type="checkbox"
                  checked={searchForm.timeType !== null}
                  onChange={(e) => onChangeTimeRadio(e.target.checked ? 'auto' : null)}
                  data-testid="layout-searchbar-filter-dialog-form-time-check"
                />
              </label>
              <label>
                빈 시간대만 검색하기
                <input
                  data-testid="layout-searchbar-filter-dialog-form-time-radio-auto"
                  type="radio"
                  disabled={searchForm.timeType === null}
                  checked={searchForm.timeType === 'auto'}
                  onChange={() => onChangeTimeRadio('auto')}
                />
              </label>
              <label>
                시간대 직접 선택하기
                <input
                  data-testid="layout-searchbar-filter-dialog-form-time-radio-manual"
                  type="radio"
                  disabled={searchForm.timeType === null}
                  checked={searchForm.timeType === 'manual'}
                  onChange={() => onChangeTimeRadio('manual')}
                />
              </label>
              <Button
                size="small"
                color="black"
                type="button"
                disabled={searchForm.timeType !== 'manual'}
                data-testid="layout-searchbar-filter-dialog-form-time-manual-button"
                onClick={() => setTimeModalOpen(true)}
              >
                선택창 열기
              </Button>
            </RowContent>
          </Row>
        </form>
      </StyledContent>
      <Button
        data-testid="main-searchbar-filter-dialog-submit"
        type="submit"
        onClick={() => {
          onSubmit();
          onClose();
        }}
      >
        검색하기
      </Button>
      <MainSearchbarFilterTimeSelectDialog
        open={isTimeModalOpen}
        onClose={() => setTimeModalOpen(false)}
        onChangeBitMask={onChangeBitMask}
      />
    </StyledDialog>
  );
};

const Checkbox = <F extends 'academicYear' | 'category' | 'classification' | 'credit' | 'department' | 'etc'>({
  value,
  label,
  searchForm,
  onChange,
  field,
  'data-testid': dataTestId,
}: {
  field: F;
  'data-testid'?: string;
  label?: string;
  value: SearchForm[F][number];
  searchForm: SearchForm;
  onChange: (field: F, value: SearchForm[F][number]) => void;
}) => (
  <label>
    {label ?? value}
    <input
      type="checkbox"
      checked={(searchForm[field] as (typeof value)[]).includes(value)}
      onChange={() => onChange(field, value)}
      data-testid={dataTestId}
    />
  </label>
);

const useSearchFilterTags = () => {
  const ys = useGuardContext(YearSemesterContext);
  const { searchService } = useGuardContext(ServiceContext);
  const { token } = useGuardContext(TokenAuthContext);

  return useQuery({
    queryKey: ['SearchService', 'getTags', { ...ys, token }] as const,
    queryFn: ({ queryKey }) => searchService.getTags(queryKey[2]),
    staleTime: Infinity,
  });
};

const StyledDialog = styled(Dialog)`
  padding: 20px 40px 40px;
  border-radius: 21px;
  max-width: 100%;
  max-height: calc(100vh - 60px);
`;

const StyledContent = styled(StyledDialog.Content)`
  border-top: 1px solid #ddd;
  padding-top: 20px;
`;

const Row = styled.div`
  display: flex;
  margin-bottom: 24px;
  font-size: 14px;
`;

const RowLabel = styled.div`
  width: 100px;
  min-width: 100px;
  opacity: 0.6;
  font-weight: 700;
  line-height: 24px;
`;

const RowContent = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const DepartmentInput = styled.input`
  outline: none;
`;
