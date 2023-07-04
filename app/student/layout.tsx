"use client";

import { StudentNavbar } from "@/components/Navbar";
import { PageLayout } from "@/components/PageLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PageLayout navbar={<StudentNavbar />}>{children}</PageLayout>;
}
