"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentPage from "./student";
import LecturerPage from "./lecturer";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentPage />;
    case PageView.Lecturer:
      return <LecturerPage />;
  }
}
