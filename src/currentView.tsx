"use client";

import React, { useContext, useEffect, useState } from "react";

export enum PageView {
  Student = "student",
  Lecturer = "TUTOR",
}

const PageViewContext = React.createContext<{
  pageView: PageView;
  setPageView: (value: PageView) => void;
} | null>(null);

export function PageViewProvider({ children }: { children: React.ReactNode }) {
  const [pageView, setPageView] = useState(
    window.localStorage.getItem("current_pageview") === "TUTOR"
      ? PageView.Lecturer
      : PageView.Student
  );

  useEffect(() => {
    window.localStorage.setItem("current_pageview", pageView);
  }, [pageView]);

  return (
    <PageViewContext.Provider value={{ pageView, setPageView }}>
      {children}
    </PageViewContext.Provider>
  );
}

export function usePageView(): [PageView, (value: PageView) => void] {
  const { pageView, setPageView } = useContext(PageViewContext)!;
  return [pageView, setPageView];
}
