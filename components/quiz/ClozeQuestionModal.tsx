import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { Add, Clear, Feedback } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Form, FormSection } from "../Form";
import { FormErrors } from "../FormErrors";
import { RichTextEditor, serializeToText } from "../RichTextEditor";
import { EditRichTextButton } from "./EditRichTextButton";
import { HintFormSection } from "./HintFormSection";

export type ClozeQuestionData = {
  hint: string | null;
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

  const atLeastOneTextElement = useMemo(
    () => data.clozeElements.filter((e) => e.type === "text").length > 0,
    [data.clozeElements]
  );
  const atLeastOneBlankElement = useMemo(
    () => data.clozeElements.filter((e) => e.type === "blank").length > 0,
    [data.clozeElements]
  );

  const allElementsFilled = useMemo(
    () =>
      data.clozeElements.every((x) =>
        x.type == "blank" ? x.correctAnswer : serializeToText(x.text)
      ),
    [data.clozeElements]
  );
  const valid =
    atLeastOneTextElement && atLeastOneBlankElement && allElementsFilled;

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
                    required
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
                    required
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
          <HintFormSection
            _allRecords={_allRecords}
            initialValue={data.hint}
            onChange={(hint) => {
              setData((oldData) => ({ ...oldData, hint }));
            }}
          />
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
              <Autocomplete
                multiple
                options={[]}
                defaultValue={[]}
                freeSolo
                value={data.additionalWrongAnswers}
                className="w-96"
                onChange={(_, newValue: string[]) => {
                  setData((oldValue) => ({
                    ...oldValue,
                    additionalWrongAnswers: newValue,
                  }));
                }}
                renderTags={(value: readonly string[], getTagProps) =>
                  value.map((option: string, index: number) => (
                    // the key gets set by "getTagProps"
                    // eslint-disable-next-line react/jsx-key
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Wrong answers"
                    helperText="Press enter to add"
                  />
                )}
              />
            </FormSection>
          )}
        </Form>
      </DialogContent>
      <DialogActions>
        <div className="text-red-600 text-xs mr-3">
          {!atLeastOneTextElement && <div>Add at least one text element</div>}
          {!atLeastOneBlankElement && <div>Add at least one blank element</div>}
          {atLeastOneTextElement && !allElementsFilled && (
            <div>All elements have to be filled</div>
          )}
        </div>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          disabled={!valid}
          loading={isLoading}
          onClick={() => onSave(data)}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
