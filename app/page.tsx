"use client";

import dynamic from "next/dynamic";

const MainBoard = dynamic(() => import("../components/MainBoard"), {
  ssr: false,
});

export default function Page() {
  return <MainBoard />;
}
