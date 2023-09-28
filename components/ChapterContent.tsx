"use client";
import React from "react";

export function ChapterContent({ children }: { children: any }) {
  return (
    <div className="px-2 pb-2 mb-6 flex gap-12 items-start overflow-x-auto thin-scrollbar">
      {children}
    </div>
  );
}
