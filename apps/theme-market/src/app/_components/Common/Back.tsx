"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import SvgChevronLeft from "@/assets/icons/svgChevronLeft.svg";

interface Props {
  className: string;
}

export const Back = ({ className }: Props) => {
  const router = useRouter();

  return (
    <div className={className} onClick={() => router.back()}>
      <Image src={SvgChevronLeft} alt="<" width="16" height="16.6" />
      <span>돌아가기</span>
    </div>
  );
};
