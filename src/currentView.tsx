"use client";

import React, { useContext, useEffect, useState } from "react";

export enum PageView {
  Student = "student",
  Lecturer = "ADMINISTRATOR",
}

const PageViewContext = React.createContext<{
  pageView: PageView;
  setPageView: (value: PageView) => void;
} | null>(null);

export function PageViewProvider({ children }: { children: React.ReactNode }) {
  const [pageView, setPageView] = useState<PageView>();

  useEffect(() => {
    if (typeof window !== "undefined" && !pageView) {
      setPageView(
        window.localStorage.getItem("current_pageview") === "ADMINISTRATOR"
          ? PageView.Lecturer
          : PageView.Student
      );
    } else if (pageView) {
      window.localStorage.setItem(
        "current_pageview",
        pageView ?? PageView.Student
      );
    }
  }, [pageView]);

  return (
    <PageViewContext.Provider
      value={{ pageView: pageView ?? PageView.Student, setPageView }}
    >
      {children}
    </PageViewContext.Provider>
  );
}

export function usePageView(): [PageView, (value: PageView) => void] {
  const { pageView, setPageView } = useContext(PageViewContext)!;
  return [pageView, setPageView];
}
