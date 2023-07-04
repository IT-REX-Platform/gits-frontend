"use client";

import { LecturerNavbar } from "@/components/Navbar";
import { PageLayout } from "@/components/PageLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageLayout navbar={<LecturerNavbar />}>{children}</PageLayout>;
}
