"use client";

import { PageView, usePageView } from "@/src/currentView";
import NewCourse from "./lecturer";
import { PageError } from "@/components/PageError";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return (
        <PageError
          title="Create course"
          message="Only lecturers can create courses."
        />
      );
    case PageView.Lecturer:
      return <NewCourse />;
  }
}
