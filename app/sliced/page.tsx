"use client";

import React from "react";
import dynamic from "next/dynamic";

const SlicedImageHoverGrid = dynamic(
  () => import("../components/SlicedImageHoverGrid"),
  { ssr: false }
);

export default function SlicedPage() {
  return <SlicedImageHoverGrid />;
}


