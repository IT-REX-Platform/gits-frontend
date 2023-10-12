"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentDueFlashcards from "./student";
import { useParams } from "next/navigation";
import { isUUID } from "@/src/utils";
import { PageError } from "@/components/PageError";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  const { courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentDueFlashcards />;
    case PageView.Lecturer:
      return (
        <PageError
          title="Due flashcards"
          message="This page is for students only."
        />
      );
  }
}
