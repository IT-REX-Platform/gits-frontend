"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentFlashcards from "./student";
import EditFlashcards from "./lecturer";
import { useParams } from "next/navigation";
import { isUUID } from "@/src/utils";
import { PageError } from "@/components/PageError";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  const { flashcardSetId, courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }
  if (!isUUID(flashcardSetId)) {
    return <PageError message="Invalid flashcards id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentFlashcards />;
    case PageView.Lecturer:
      return <EditFlashcards />;
  }
}
