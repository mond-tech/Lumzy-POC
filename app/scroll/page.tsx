"use client";

import dynamic from "next/dynamic";
const HorizontalParallaxGallery = dynamic(() => import("../../components/specific/parallax/HorizontalParallaxGallery"), { ssr: false });
 
export default function Test2() {
    return (
        <main className="min-h-screen bg-[#0c0b10]">
            <HorizontalParallaxGallery />
        </main>
    );
}
 