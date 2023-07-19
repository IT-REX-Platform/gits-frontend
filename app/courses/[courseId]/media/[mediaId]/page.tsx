"use client";

import { PageView, usePageView } from "@/src/currentView";
import LecturerMediaPage from "./lecturer";
import StudentMediaPage from "./student";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentMediaPage />;
    case PageView.Lecturer:
      return <LecturerMediaPage />;
  }
}
