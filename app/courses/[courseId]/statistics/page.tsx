"use client";

import Error from "next/error";
import { PageView, usePageView } from "@/src/currentView";
import StudentCourseStatsPage from "./student";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentCourseStatsPage />;
    case PageView.Lecturer:
      return <Error statusCode={404} />;
  }
}
