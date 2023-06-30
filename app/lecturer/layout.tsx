"use client";

import { LecturerNavbar } from "@/components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_1fr] h-[100vh] overflow-hidden">
      <LecturerNavbar />
      <div className="overflow-auto">{children}</div>
    </div>
  );
}