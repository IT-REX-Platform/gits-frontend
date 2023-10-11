"use client";

import { InvalidContentLinkDeleteMutation } from "@/__generated__/InvalidContentLinkDeleteMutation.graphql";
import { PageView, usePageView } from "@/src/currentView";
import { Delete, QuestionMark } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useContext, useState } from "react";
import { graphql, useMutation } from "react-relay";
import colors from "tailwindcss/colors";
import { ContentBase, ContentLinkProps } from "./ContentBase";
import { StaticFrame } from "./StaticFrame";

export function InvalidContentLink({
  type,
  title,
  id,
  chapterId,
}: {
  type: string;
  title: string;
  id: string;
  chapterId: string;
}) {
  const { disabled } = useContext(ContentLinkProps);
  const [del, deleting] = useMutation<InvalidContentLinkDeleteMutation>(graphql`
    mutation InvalidContentLinkDeleteMutation($id: UUID!) {
      mutateContent(contentId: $id) {
        deleteContent
      }
    }
  `);

  // this workaround is required because we are deleting the record without actually navigating, so "invalidateRecord" won't trigger re-evaluation of the query
  const [deleted, setDeleted] = useState(false);

  const [pageView] = usePageView();
  if (pageView === PageView.Student) {
    return null;
  }

  if (deleted) {
    return null;
  }

  return (
    <ContentBase
      type={type}
      title={title}
      className="hover:bg-gray-100"
      color={disabled ? colors.gray[100] : colors.gray[300]}
      action={
        pageView === PageView.Lecturer ? (
          <IconButton
            href="#"
            onClick={(e) => {
              e.stopPropagation();
              if (!deleting) {
                del({
                  variables: { id },
                  updater(store) {
                    store.get(id)?.invalidateRecord();
                  },
                  onCompleted() {
                    setDeleted(true);
                  },
                });
              }
            }}
          >
            <Delete />
          </IconButton>
        ) : undefined
      }
      icon={
        <QuestionMark
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-gray-300"} />
      }
      square
    />
  );
}
