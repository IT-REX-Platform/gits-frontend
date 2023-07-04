"use client";

import { StudentNavbar } from "@/components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex overflow-hidden h-full bg-slate-200 justify-center">
      <StudentNavbar />
      <div className="grow overflow-auto flex flex-col">
        <div className="px-8 py-11 max-w-[96rem] mr-8 my-8 bg-white rounded-[3rem] grow">
          {children}
        </div>
      </div>
    </div>
  );
}
