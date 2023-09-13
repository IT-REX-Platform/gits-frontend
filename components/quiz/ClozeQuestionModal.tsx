import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Switch,
  TextField,
} from "@mui/material";
import { FormErrors } from "../FormErrors";
import { Form, FormSection } from "../Form";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { RenderRichText, RichTextEditor } from "../RichTextEditor";
import { useEffect, useState } from "react";
import { RichTextEditorFragment$key } from "@/__generated__/RichTextEditorFragment.graphql";
import {
  Add,
  Clear,
  Delete,
  Feedback,
  Help,
  HelpOutline,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { EditRichTextButton } from "./EditRichTextButton";

export type ClozeQuestionData = {
  showBlanksList: boolean;
  additionalWrongAnswers: string[];
  clozeElements: ClozeElementData[];
};
export type ClozeElementData =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "blank";
      correctAnswer: string;
      feedback: string;
    };

export function ClozeQuestionModal({
  _allRecords,
  open,
  title,
  error,
  initialValue,
  isLoading,
  onSave,
  onClose,
  clearError,
}: {
  _allRecords: MediaRecordSelector$key;
  open: boolean;
  title: string;
  error: any;
  initialValue: ClozeQuestionData;
  isLoading: boolean;
  onSave: (data: ClozeQuestionData) => void;
  onClose: () => void;
  clearError: () => void;
}) {
  const [data, setData] = useState(initialValue);
  const [wrongAnswer, setWrongAnswer] = useState("");
  const updateElement = (index: number, value: ClozeElementData) => {
    setData((oldValue) => ({
      ...oldValue,
      clozeElements: [
        ...oldValue.clozeElements.slice(0, index),
        value,
        ...oldValue.clozeElements.slice(index + 1),
      ],
    }));
  };
  const addElement = (value: ClozeElementData) => {
    setData((oldValue) => ({
      ...oldValue,
      clozeElements: [...oldValue.clozeElements, value],
    }));
  };
  const deleteElement = (index: number) => {
    setData((oldValue) => ({
      ...oldValue,
      clozeElements: [
        ...oldValue.clozeElements.slice(0, index),
        ...oldValue.clozeElements.slice(index + 1),
      ],
    }));
  };
  const addWrongAnswer = () => {
    setData((oldValue) => {
      const value = {
        ...oldValue,
        additionalWrongAnswers: [
          ...oldValue.additionalWrongAnswers,
          wrongAnswer,
        ],
      };
      setWrongAnswer("");
      return value;
    });
  };
  const deleteWrongAnswer = (index: number) => {
    setData((oldValue) => ({
      ...oldValue,
      additionalWrongAnswers: [
        ...oldValue.additionalWrongAnswers.slice(0, index),
        ...oldValue.additionalWrongAnswers.slice(index + 1),
      ],
    }));
  };

  useEffect(() => {
    if (!open) {
      setData(initialValue);
    }
  }, [open, initialValue]);

  return (
    <Dialog open={open} maxWidth="lg" onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <FormErrors error={error} onClose={clearError} />
        <Form>
          <FormSection title="Cloze text">
            {data.clozeElements.map((elem, i) =>
              elem.type === "text" ? (
                <div key={i} className="flex items-center">
                  <RichTextEditor
                    className="w-[700px]"
                    _allRecords={_allRecords}
                    label="Text"
                    initialValue={elem.text}
                    onChange={(text) =>
                      updateElement(i, { type: "text", text })
                    }
                  />
                  <IconButton
                    className="!mt-2"
                    onClick={() => deleteElement(i)}
                  >
                    <Clear />
                  </IconButton>
                </div>
              ) : (
                <div key={i} className="flex items-center">
                  <TextField
                    className="!mr-4"
                    variant="outlined"
                    label="Blank"
                    value={elem.correctAnswer}
                    onChange={(e) =>
                      updateElement(i, {
                        type: "blank",
                        correctAnswer: e.target.value,
                        feedback: elem.feedback,
                      })
                    }
                  />
                  <EditRichTextButton
                    _allRecords={_allRecords}
                    title="Edit feedback"
                    icon={<Feedback />}
                    initialValue={elem.feedback}
                    onSave={(value) =>
                      updateElement(i, {
                        type: "blank",
                        correctAnswer: elem.correctAnswer,
                        feedback: value,
                      })
                    }
                  />
                  <IconButton onClick={() => deleteElement(i)}>
                    <Clear />
                  </IconButton>
                </div>
              )
            )}
            <div className="flex gap-2 mt-2">
              <Button
                startIcon={<Add />}
                onClick={() => addElement({ type: "text", text: "" })}
              >
                Add text
              </Button>
              <Button
                startIcon={<Add />}
                onClick={() =>
                  addElement({ type: "blank", correctAnswer: "", feedback: "" })
                }
              >
                Add blank
              </Button>
            </div>
          </FormSection>
          <FormSection title="Options">
            <FormControlLabel
              label="Freetext blanks"
              control={
                <Checkbox
                  checked={!data.showBlanksList}
                  onChange={(e) =>
                    setData((oldValue) => ({
                      ...oldValue,
                      showBlanksList: !e.target.checked,
                    }))
                  }
                />
              }
            />
          </FormSection>
          {data.showBlanksList && (
            <FormSection title="Additional wrong answers">
              <div className="flex gap-2 items-center flex-wrap max-w-md mt-2">
                {data.additionalWrongAnswers.map((value, i) => (
                  <Chip
                    key={i}
                    label={value}
                    onDelete={() => deleteWrongAnswer(i)}
                  />
                ))}
              </div>
              <div className="mt-2">
                <TextField
                  variant="outlined"
                  size="small"
                  label="Add wrong answer"
                  value={wrongAnswer}
                  onChange={(e) => setWrongAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWrongAnswer()}
                />
              </div>
            </FormSection>
          )}
        </Form>
      </DialogContent>
      <DialogActions>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton loading={isLoading} onClick={() => onSave(data)}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
