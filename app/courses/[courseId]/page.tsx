"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentCoursePage from "./student";
import LecturerCoursePage from "./lecturer";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentCoursePage />;
    case PageView.Lecturer:
      return <LecturerCoursePage />;
  }
}
