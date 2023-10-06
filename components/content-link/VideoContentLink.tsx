"use client";

import { VideoContentLinkFragment$key } from "@/__generated__/VideoContentLinkFragment.graphql";
import { ArrowRight } from "@mui/icons-material";
import { useContext } from "react";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { ProgressFrame } from "./ProgressFrame";
import { ContentLinkProps } from "./ContentBase";

export function VideoContentLink({
  title,
  onClick,
  _media,
}: {
  title: string;
  onClick: () => void;
  _media: VideoContentLinkFragment$key;
}) {
  const { disabled } = useContext(ContentLinkProps);
  const media = useFragment(
    graphql`
      fragment VideoContentLinkFragment on MediaContent {
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
      type="Video"
      title={title}
      className="hover:bg-sky-100"
      color={disabled ? colors.gray[100] : colors.sky[200]}
      onClick={onClick}
      icon={
        <ArrowRight
          className="!w-3/4 !h-3/4"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.sky[200]}
          _progress={media.userProgressData}
        />
      }
    />
  );
}
