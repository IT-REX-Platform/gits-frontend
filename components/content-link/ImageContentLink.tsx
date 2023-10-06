"use client";

import { ImageContentLinkFragment$key } from "@/__generated__/ImageContentLinkFragment.graphql";
import { Image as ImageIcon } from "@mui/icons-material";
import { useContext } from "react";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { ProgressFrame } from "./ProgressFrame";
import { ContentLinkProps } from "./ContentBase";

export function ImageContentLink({
  title,
  onClick,
  _media,
}: {
  title: string;
  onClick: () => void;
  _media: ImageContentLinkFragment$key;
}) {
  const { disabled } = useContext(ContentLinkProps);
  const media = useFragment(
    graphql`
      fragment ImageContentLinkFragment on MediaContent {
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
      type="Image"
      title={title}
      className="hover:bg-cyan-100"
      color={disabled ? colors.gray[100] : colors.cyan[200]}
      onClick={onClick}
      icon={
        <ImageIcon
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.cyan[200]}
          _progress={media.userProgressData}
        />
      }
    />
  );
}
