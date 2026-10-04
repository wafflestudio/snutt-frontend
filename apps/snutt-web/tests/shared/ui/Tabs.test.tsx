// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Tab, TabList, TabPanel, Tabs } from '@/shared/ui/Tabs';

type PanelTab = 'search' | 'lectures' | 'bookmark';

function PanelTabs() {
  const [tab, setTab] = useState<PanelTab>('search');
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabList>
        <Tab value="search">검색</Tab>
        <Tab value="lectures">강의 목록</Tab>
        <Tab value="bookmark">관심강좌</Tab>
      </TabList>
      <TabPanel value="search">검색 내용</TabPanel>
      <TabPanel value="lectures">강의 목록 내용</TabPanel>
      <TabPanel value="bookmark">관심강좌 내용</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('선택한 탭의 내용만 보인다', async () => {
    render(<PanelTabs />);
    expect(screen.getByRole('tab', { name: '검색' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('검색 내용')).toBeVisible();

    await userEvent.click(screen.getByRole('tab', { name: '관심강좌' }));
    expect(screen.getByRole('tab', { name: '관심강좌' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('관심강좌 내용')).toBeVisible();
    // 선택되지 않은 패널은 DOM 에서 빠진다 (Base UI 기본 동작)
    expect(screen.queryByText('검색 내용')).not.toBeInTheDocument();
  });

  it('방향키로 이동하고 Enter 로 선택한다', async () => {
    render(<PanelTabs />);
    await userEvent.click(screen.getByRole('tab', { name: '검색' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: '강의 목록' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('tab', { name: '강의 목록' })).toHaveAttribute('aria-selected', 'true');
  });
});
