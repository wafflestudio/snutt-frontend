import { createContext, type HTMLAttributes, useContext } from 'react';
import styled from 'styled-components';

type TabValue = string;

// Context

type TabsContext = { value?: TabValue | null };
const tabsContext = createContext<TabsContext | null>(null);

// Tab

export interface TabProps extends HTMLAttributes<HTMLDivElement> {
  value: TabValue;
}
const Tab = ({ value, children, ...props }: TabProps) => {
  const selected = value === useContext(tabsContext)?.value;

  return (
    <TabWrapper $selected={selected} {...props}>
      {children}
    </TabWrapper>
  );
};

const TabWrapper = styled.div<{ $selected: boolean }>`
  padding: 6px 8px;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;

  transition: opacity 0.1s;

  opacity: ${({ $selected }) => ($selected ? 1 : 0.2)};
  font-weight: ${({ $selected }) => ($selected ? 700 : 400)};
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: ${({ $selected }) => ($selected ? '#1bd0c9' : 'transparent')};
`;

// Tabs

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value?: TabValue | null;
}
export const Tabs = ({ value, children, ...props }: TabsProps) => {
  const { Provider } = tabsContext;
  return (
    <TabsWrapper {...props}>
      <Provider value={{ value }}>{children}</Provider>
    </TabsWrapper>
  );
};

Tabs.Tab = Tab;

const TabsWrapper = styled.div`
  display: flex;
  align-items: center;
`;
