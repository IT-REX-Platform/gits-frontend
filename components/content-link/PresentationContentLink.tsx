"use client";

import { PresentationContentLinkFragment$key } from "@/__generated__/PresentationContentLinkFragment.graphql";
import { PersonalVideo } from "@mui/icons-material";
import { useContext } from "react";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { ProgressFrame } from "./ProgressFrame";
import { ContentLinkProps } from "./ContentBase";

export function PresentationContentLink({
  title,
  onClick,
  _media,
}: {
  title: string;
  onClick: () => void;
  _media: PresentationContentLinkFragment$key;
}) {
  const { disabled } = useContext(ContentLinkProps);
  const media = useFragment(
    graphql`
      fragment PresentationContentLinkFragment on MediaContent {
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
      type="Slides"
      title={title}
      className="hover:bg-violet-100"
      color={disabled ? colors.gray[100] : colors.violet[200]}
      onClick={onClick}
      icon={
        <PersonalVideo
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.violet[200]}
          _progress={media.userProgressData}
        />
      }
    />
  );
}
