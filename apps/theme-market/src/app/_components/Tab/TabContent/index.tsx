import { MouseEventHandler } from "react";

import styles from "./index.module.css";
import classNames from "classnames";

export const TabContent = ({
  content,
  selected,
  onClick,
}: {
  content: String;
  selected: Boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}) => {
  return (
    <div
      className={classNames(styles.content, { [styles.selected]: selected })}
      onClick={onClick}
    >
      <span>{content}</span>
    </div>
  );
};
