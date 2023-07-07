"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentCourseList from "./student";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentCourseList />;
    case PageView.Lecturer:
      return <StudentCourseList />;
  }
}
