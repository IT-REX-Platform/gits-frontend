"use client";
import React from "react";

export function PageLayout({
  navbar,
  children,
}: {
  navbar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex overflow-hidden h-full bg-slate-200">
      {navbar}
      <div className="grow overflow-auto flex flex-col">
        <div className="px-8 py-11 mr-8 my-8 bg-white rounded-[3rem] grow">
          {children}
        </div>
      </div>
    </div>
  );
}
