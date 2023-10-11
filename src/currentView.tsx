"use client";

import { currentViewQuery } from "@/__generated__/currentViewQuery.graphql";
import React, { useContext, useEffect, useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

export enum PageView {
  Student = "Student",
  Lecturer = "Lecturer",
}

const PageViewContext = React.createContext<{
  pageView: PageView;
  setPageView: (value: PageView) => void;
} | null>(null);

export function PageViewProvider({ children }: { children: React.ReactNode }) {
  const { currentUserInfo } = useLazyLoadQuery<currentViewQuery>(
    graphql`
      query currentViewQuery {
        currentUserInfo {
          id
          realmRoles
        }
      }
    `,
    {}
  );

  const [pageView, setPageView] = useState<PageView>();

  useEffect(() => {
    if (typeof window !== "undefined" && !pageView) {
      const defaultRole =
        currentUserInfo.realmRoles.includes("super-user") ||
        currentUserInfo.realmRoles.includes("course-creator")
          ? PageView.Lecturer
          : PageView.Student;

      setPageView(
        window.localStorage.getItem("current_pageview")
          ? window.localStorage.getItem("current_pageview") ===
            PageView.Lecturer
            ? PageView.Lecturer
            : PageView.Student
          : defaultRole
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
