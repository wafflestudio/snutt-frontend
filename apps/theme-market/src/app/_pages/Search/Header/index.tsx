"use client";

import { useRouter } from "next/navigation";

import { Input } from "@/app/_components/Input";

import styles from "./index.module.css";

interface Props {
  defaultValue: string;
}

export const SearchHeader = ({ defaultValue }: Props) => {
  const router = useRouter();

  return (
    <div className={styles.inputWrapper}>
      <Input
        className={styles.input}
        placeholder="테마를 검색해보세요"
        type="search"
        defaultValue={defaultValue}
        onComplete={(value: String) => router.replace(`/search/${value}`)}
      />
    </div>
  );
};
