import type { Metadata } from "next";
import { PropsWithChildren } from "react";

import "./reset.css";

export const metadata: Metadata = {
  title: "SNUTT 강의평",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
