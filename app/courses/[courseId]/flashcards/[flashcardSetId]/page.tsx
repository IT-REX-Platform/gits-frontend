"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentFlashcards from "./student";
import EditFlashcards from "./lecturer";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentFlashcards />;
    case PageView.Lecturer:
      return <EditFlashcards />;
  }
}
