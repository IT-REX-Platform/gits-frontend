"use client";

import { Download } from "@mui/icons-material";
import { MouseEventHandler, useContext } from "react";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { StaticFrame } from "./StaticFrame";
import { ContentLinkProps } from "./ContentBase";

export function MaterialContentLink({
  title,
  onClick = undefined,
}: {
  title: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  const { disabled } = useContext(ContentLinkProps);
  return (
    <ContentBase
      type="Download"
      title={title}
      className="hover:bg-amber-100"
      color={disabled ? colors.gray[100] : colors.amber[600]}
      onClick={onClick}
      icon={
        <Download
          sx={{ color: disabled ? "text.disabled" : "text.secondary" }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-amber-600"} />
      }
      square
    />
  );
}
