"use client";

import { InputHTMLAttributes, useState } from "react";
import styles from "./index.module.css";
import classNames from "classnames";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  onComplete?: (value: string) => void;
}

export const Input = ({
  onComplete,
  className,
  defaultValue,
  ...props
}: Props) => {
  const [value, setValue] = useState<string>((defaultValue || "").toString());

  return (
    <input
      {...props}
      className={classNames(className, styles.input)}
      value={value}
      onKeyDown={(e) => {
        if (e.key === "Enter") onComplete?.(value);
      }}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};
