"use client";

import { DeleteForever } from "@mui/icons-material";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { StaticFrame } from "./StaticFrame";
import { ContentSize, ContentLinkProps } from "./ContentBase";

export function DeletedContentLink({
  size = "normal",
}: {
  size?: ContentSize;
}) {
  return (
    <ContentLinkProps.Provider value={{ disabled: true, chips: [], size }}>
      <ContentBase
        title="Deleted content"
        className="!bg-transparent"
        color={colors.gray[100]}
        icon={
          <DeleteForever
            className="!w-1/2 !h-1/2"
            sx={{
              color: "text.disabled",
            }}
          />
        }
        iconFrame={<StaticFrame color="bg-gray-100" />}
        square
      />
    </ContentLinkProps.Provider>
  );
}
