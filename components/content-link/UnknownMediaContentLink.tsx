"use client";

import { UnknownMediaContentLinkFragment$key } from "@/__generated__/UnknownMediaContentLinkFragment.graphql";
import { QuestionMark } from "@mui/icons-material";
import { useContext } from "react";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { ProgressFrame } from "./ProgressFrame";
import { ContentLinkProps } from "./ContentBase";

export function UnknownMediaContentLink({
  title,
  onClick,
  _media,
}: {
  title: string;
  onClick: () => void;
  _media: UnknownMediaContentLinkFragment$key;
}) {
  const { disabled } = useContext(ContentLinkProps);
  const media = useFragment(
    graphql`
      fragment UnknownMediaContentLinkFragment on MediaContent {
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
      type="Empty media"
      title={title}
      className="hover:bg-gray-100"
      color={disabled ? colors.gray[100] : colors.gray[200]}
      onClick={onClick}
      icon={
        <QuestionMark
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.gray[200]}
          _progress={media.userProgressData}
        />
      }
    />
  );
}
