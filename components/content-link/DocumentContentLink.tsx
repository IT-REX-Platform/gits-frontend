"use client";

import { DocumentContentLinkFragment$key } from "@/__generated__/DocumentContentLinkFragment.graphql";
import { Description } from "@mui/icons-material";
import { useContext } from "react";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { ProgressFrame } from "./ProgressFrame";
import { ContentLinkProps } from "./ContentBase";

export function DocumentContentLink({
  title,
  onClick,
  _media,
}: {
  title: string;
  onClick: () => void;
  _media: DocumentContentLinkFragment$key;
}) {
  const { disabled } = useContext(ContentLinkProps);
  const media = useFragment(
    graphql`
      fragment DocumentContentLinkFragment on MediaContent {
        id
        userProgressData {
          ...ProgressFrameFragment
        }
      }
    `,
    _media
  );

  return (
    <ContentBase
      type="Document"
      title={title}
      className="hover:bg-indigo-100"
      color={disabled ? colors.gray[100] : colors.indigo[200]}
      onClick={onClick}
      icon={
        <Description
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.indigo[200]}
          _progress={media.userProgressData}
        />
      }
    />
  );
}
