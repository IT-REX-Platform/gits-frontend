"use client";

import { PageView, usePageView } from "@/src/currentView";
import EditQuiz from "./lecturer";
import StudentQuiz from "./student";
//import EditQuiz from "./lecturer";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentQuiz />;
    case PageView.Lecturer:
      return <EditQuiz />;
  }
}
