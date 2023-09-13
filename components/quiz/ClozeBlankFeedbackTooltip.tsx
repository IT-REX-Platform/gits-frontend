import { RichTextEditorFragment$key } from "@/__generated__/RichTextEditorFragment.graphql";
import { Box, Tooltip } from "@mui/material";
import { ReactElement } from "react";
import { RenderRichText } from "../RichTextEditor";

export function ClozeBlankFeedbackTooltip({
  disabled = false,
  feedback,
  correctAnswer,
  children,
}: {
  feedback: RichTextEditorFragment$key | null;
  children: ReactElement;
  correctAnswer: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return children;
  }

  return (
    <Tooltip
      arrow
      placement="right"
      title={
        <div className="font-normal">
          <div className="text-sm">&rarr; {correctAnswer}</div>
          {feedback && <RenderRichText value={feedback} />}
        </div>
      }
      classes={{
        tooltip: "!bg-white border border-gray-200 !text-black",
      }}
    >
      <Box display="inline-block">{children}</Box>
    </Tooltip>
  );
}
