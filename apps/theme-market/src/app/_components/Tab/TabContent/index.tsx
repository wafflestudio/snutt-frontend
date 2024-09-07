import { MouseEventHandler, ReactNode } from "react";

import styles from "./index.module.css";
import classNames from "classnames";

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
