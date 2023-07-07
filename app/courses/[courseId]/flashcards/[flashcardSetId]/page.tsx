"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentFlashcards from "./student";
import Error from "next/error";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <StudentFlashcards />;
    case PageView.Lecturer:
      return <Error statusCode={404} />;
  }
}
