"use client";

import { PageView, usePageView } from "@/src/currentView";
import { useParams } from "next/navigation";
import { isUUID } from "@/src/utils";
import { PageError } from "@/components/PageError";
import LecturerCourseMembersPage from "./lecturer";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  const { courseId } = useParams();

  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }

  switch (pageView) {
    case PageView.Student:
      return (
        <PageError
          title="Course members"
          message="Only lecturers can access this page"
        />
      );
    case PageView.Lecturer:
      return <LecturerCourseMembersPage />;
  }
}
