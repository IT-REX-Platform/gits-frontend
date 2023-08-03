"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentQuiz from "./student";
import Error from "next/error";
//import EditQuiz from "./lecturer";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentQuiz />;
    case PageView.Lecturer:
      return <Error statusCode={404} />;
  }
}
