"use client";

import { Language } from "@mui/icons-material";
import { useContext } from "react";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { StaticFrame } from "./StaticFrame";
import { ContentLinkProps } from "./ContentBase";

export function UrlContentLink({ title }: { title: string }) {
  const { disabled } = useContext(ContentLinkProps);
  return (
    <ContentBase
      type="Url"
      title={title}
      className="hover:bg-slate-100"
      color={disabled ? colors.gray[100] : colors.gray[400]}
      icon={
        <Language
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "white",
          }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-gray-400"} />
      }
      square
    />
  );
}
