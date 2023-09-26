"use client";

import { PageView, usePageView } from "@/src/currentView";
import StudentCoursePage from "./student";
import LecturerCoursePage from "./lecturer";
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
      return <StudentCoursePage />;
    case PageView.Lecturer:
      return <LecturerCoursePage />;
  }
}
