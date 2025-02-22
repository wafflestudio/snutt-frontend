import { MouseEventHandler, ReactNode } from "react";
import classNames from "classnames";

import styles from "./index.module.css";

export const TabContent = ({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: Boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <div
      className={classNames(styles.content, { [styles.selected]: selected })}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
