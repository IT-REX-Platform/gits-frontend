import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Form, FormSection } from "@/components/Form";

export function EditSideModal({
  onClose,
  onSubmit,
  side,
}: {
  onClose: () => void;
  onSubmit: (side: FlashcardSideData) => void;
  side?: FlashcardSideData;
}) {
  const [label, setLabel] = useState(side?.label ?? "");
  // Initialize the text state with an empty object of type FlashcardSideDataMarkdown
  const [text, setText] = useState(side?.text ?? "");
  const [isQuestion, setIsQuestion] = useState(side?.isQuestion ?? false);
  const [isAnswer, setIsAnswer] = useState(side?.isAnswer ?? false);
  const [labelOverride, setLabelOverride] = useState(false);

  const valid =
    label.trim() != "" && text.trim() != "" && (isQuestion || isAnswer);

  useEffect(() => {
    // Do not change the label once it has been manually edited, reset when label empty
    if (labelOverride && label === "") {
      setLabelOverride(false);
    } else if (labelOverride) {
      return;
    }
    if (!["", "Question", "Answer"].includes(label)) {
      setLabelOverride(true);
      return;
    }

    // Auto-populate label
    if (isQuestion && !isAnswer && label !== "Question") {
      setLabel("Question");
    } else if (!isQuestion && isAnswer && label !== "Answer") {
      setLabel("Answer");
    } else if (isQuestion === isAnswer) {
      setLabel("");
    }
  }, [isQuestion, isAnswer, label, labelOverride]);

  return (
    <Dialog maxWidth="md" open onClose={onClose}>
      <DialogTitle>{side ? "Edit" : "Add"} flashcard side</DialogTitle>
      <DialogContent>
        <Form>
          <FormSection title="General">
            <FormGroup row>
              <FormControlLabel
                label="Question"
                control={
                  <Checkbox
                    checked={isQuestion}
                    onChange={(e) => setIsQuestion(e.target.checked)}
                  />
                }
              />
              <FormControlLabel
                label="Answer"
                control={
                  <Checkbox
                    checked={isAnswer}
                    onChange={(e) => setIsAnswer(e.target.checked)}
                  />
                }
              />
            </FormGroup>
            <TextField
              className="w-96"
              label="Label"
              variant="outlined"
              value={label}
              error={side && label.trim() == ""}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
            <TextField
              className="w-96"
              label="Text"
              variant="outlined"
              value={text} // Access the 'text' property of the 'text' state
              error={side && text.trim() == ""}
              onChange={(e) => setText(e.target.value)}
              multiline
              required
            />
          </FormSection>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!valid}
          onClick={() => onSubmit({ label, text, isQuestion, isAnswer })}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type FlashcardSideData = {
  label: string;
  text: string;
  isQuestion: boolean;
  isAnswer: boolean;
};
