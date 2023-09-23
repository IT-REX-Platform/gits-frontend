import { Box, Tooltip } from "@mui/material";
import { ReactElement, ReactNode } from "react";
import { RenderRichText } from "../RichTextEditor";

export function FeedbackTooltip({
  disabled = false,
  feedback,
  correctAnswer,
  children,
}: {
  feedback: string | null;
  children: ReactElement;
  correctAnswer?: ReactNode;
  disabled?: boolean;
}) {
  if (disabled || (feedback == null && correctAnswer == null)) {
    return children;
  }

  return (
    <Tooltip
      arrow
      placement="right"
      title={
        <div className="font-normal">
          {correctAnswer && (
            <div className="text-sm">&rarr; {correctAnswer}</div>
          )}
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
