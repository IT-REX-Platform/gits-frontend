"use client";

import { PageView, usePageView } from "@/src/currentView";
import NewCourse from "./lecturer";
import Error from "next/error";

export default function CoursePage() {
  const [pageView, _] = usePageView();
  switch (pageView) {
    case PageView.Student:
      return <Error statusCode={403} />;
    case PageView.Lecturer:
      return <NewCourse />;
  }
}
