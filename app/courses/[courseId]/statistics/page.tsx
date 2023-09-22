"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentCourseStatsPage from "./student";
import { isUUID } from "@/src/utils";
import { useParams } from "next/navigation";
import { PageError } from "@/components/PageError";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  const { courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return <StudentCourseStatsPage />;
    case PageView.Lecturer:
      return (
        <PageError
          title="Statistics"
          message="Switch to student view to see your statistics."
        />
      );
  }
}
