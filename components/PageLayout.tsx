"use client";
import React from "react";
import { Navbar } from "./Navbar";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex overflow-hidden h-full bg-slate-200">
      <Navbar />
      <div className="grow overflow-auto flex flex-col">
        <div className="px-8 py-11 mr-8 my-8 bg-white rounded-[3rem] grow">
          {children}
        </div>
      </div>
    </div>
  );
}
