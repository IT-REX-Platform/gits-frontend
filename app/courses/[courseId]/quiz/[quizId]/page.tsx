"use client";

import { PageView, usePageView } from "@/src/currentView";
import LecturerQuiz from "./lecturer";
import StudentQuiz from "./student";
import { isUUID } from "@/src/utils";
import { PageError } from "@/components/PageError";
import { useParams } from "next/navigation";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  const { quizId, courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }
  if (!isUUID(quizId)) {
    return <PageError message="Invalid quiz id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentQuiz />;
    case PageView.Lecturer:
      return <LecturerQuiz />;
  }
}
