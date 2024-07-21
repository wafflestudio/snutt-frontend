import { InputHTMLAttributes } from "react";
import styles from "./index.module.css";
import classNames from "classnames";

interface Props extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = (props: Props) => {
  return (
    <input {...props} className={classNames(props.className, styles.input)} />
  );
};
