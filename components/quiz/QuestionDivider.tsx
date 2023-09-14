import { QuestionDividerFragment$key } from "@/__generated__/QuestionDividerFragment.graphql";
import { Button, Dialog, DialogTitle, Typography } from "@mui/material";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";

export function QuestionDivider({
  _question,
  onHint,
}: {
  _question: QuestionDividerFragment$key;
  onHint?: () => void;
}) {
  const question = useFragment(
    graphql`
      fragment QuestionDividerFragment on Question {
        hint
      }
    `,
    _question
  );

  return (
    <div className="w-full my-6 flex justify-center border-b border-b-gray-300">
      <HintDialogButton hint={question.hint} onHint={onHint} />
    </div>
  );
}

function HintDialogButton({
  hint,
  onHint,
}: {
  hint: string | null;
  onHint?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
          if (onHint) onHint();
        }}
        sx={{ color: "grey" }}
      >
        Hint
      </Button>
      <Dialog onClose={() => setOpen(false)} open={open}>
        <DialogTitle>Hint</DialogTitle>
        <Typography variant="body1" sx={{ padding: 3, paddingTop: 0 }}>
          {hint ? (
            <RenderRichText value={hint} />
          ) : (
            "There are no hints for this question."
          )}
        </Typography>
      </Dialog>
    </>
  );
}
