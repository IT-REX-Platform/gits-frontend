import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import {
  CreateMultipleChoiceQuestionInput,
  MultipleChoiceQuestionModalAddMutation,
} from "@/__generated__/MultipleChoiceQuestionModalAddMutation.graphql";
import { MultipleChoiceQuestionModalEditMutation } from "@/__generated__/MultipleChoiceQuestionModalEditMutation.graphql";
import { Form, FormSection } from "@/components/Form";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Add, Delete } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import { cloneDeep } from "lodash";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";

export function MultipleChoiceQuestionModal({
  open,
  onClose: _onClose,
  assessmentId,
  contentId,
  _allRecords,
  existingQuestion,
}: {
  _allRecords: MediaRecordSelector$key;

  open: boolean;
  onClose: () => void;
  assessmentId: string;
  contentId: string;
  existingQuestion?: NonNullable<
    lecturerEditQuizQuery["response"]["contentsByIds"][0]["quiz"]
  >["questionPool"][0];
}) {
  const [error, setError] = useState<any>(null);

  const [addQuestion, isLoading] =
    useMutation<MultipleChoiceQuestionModalAddMutation>(graphql`
      mutation MultipleChoiceQuestionModalAddMutation(
        $input: CreateMultipleChoiceQuestionInput!
        $assessmentId: UUID!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          addMultipleChoiceQuestion(input: $input) {
            assessmentId
            questionPool {
              id
              ... on MultipleChoiceQuestion {
                number
                text
                hint
                answers {
                  correct
                  feedback
                  answerText
                }
              }
            }
          }
        }
      }
    `);
  const [updateQuestion, isLoadingUpd] =
    useMutation<MultipleChoiceQuestionModalEditMutation>(graphql`
      mutation MultipleChoiceQuestionModalEditMutation(
        $input: UpdateMultipleChoiceQuestionInput!
        $assessmentId: UUID!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          updateMultipleChoiceQuestion(input: $input) {
            assessmentId
            questionPool {
              id
              ... on MultipleChoiceQuestion {
                number
                text
                hint
                answers {
                  correct
                  feedback
                  answerText
                }
              }
            }
          }
        }
      }
    `);

  const defaultValues: CreateMultipleChoiceQuestionInput = existingQuestion
    ? cloneDeep({
        answers:
          existingQuestion.answers?.map((x) => ({
            answerText: { text: x.answerText.text },
            correct: x.correct,
            feedback: { text: x.feedback?.text ?? "" },
          })) ?? [],
        text: { text: existingQuestion.text!.text },
        hint: { text: existingQuestion.hint!.text },
      })
    : {
        answers: [
          { answerText: { text: "" }, correct: false, feedback: { text: "" } },
          { answerText: { text: "" }, correct: false, feedback: { text: "" } },
        ],
        text: { text: "" },
        hint: { text: "" },
      };

  const [input, setInput] =
    useState<CreateMultipleChoiceQuestionInput>(defaultValues);

  const onClose = () => {
    setInput(defaultValues);
    setError(undefined);
    _onClose();
  };

  const handleSubmit = () => {
    existingQuestion
      ? updateQuestion({
          variables: {
            assessmentId,
            input: { ...input, id: existingQuestion.id },
          },
          onCompleted() {
            onClose();
          },
          onError: setError,
        })
      : addQuestion({
          variables: { input, assessmentId },
          onCompleted() {
            onClose();
          },
          updater(
            store,
            {
              mutateQuiz: {
                addMultipleChoiceQuestion: { questionPool },
              },
            }
          ) {
            const content = store.get(contentId);
            const quiz = content?.getLinkedRecord("quiz");
            const allQuestions = questionPool.flatMap((x) => {
              const record = store.get(x.id);
              return record ? [record] : [];
            });

            if (!quiz) {
              console.error("not found");
              return;
            }

            quiz.setLinkedRecords(allQuestions, "questionPool");
          },
          onError: setError,
        });
  };

  const oneAnswerCorrect = input.answers.some((x) => x.correct === true);
  const atLeastTwoAnswers = input.answers.length >= 2;

  const valid = oneAnswerCorrect && atLeastTwoAnswers;

  return (
    <Dialog open={open} maxWidth="lg" onClose={onClose}>
      <DialogTitle>
        {existingQuestion ? "Edit" : "Add"} multiple choice question
      </DialogTitle>
      <DialogContent>
        {error && (
          <div className="flex flex-col gap-2 mt-8">
            {error?.source?.errors.map((err: any, i: number) => (
              <Alert key={i} severity="error" onClose={() => setError(null)}>
                {err.message}
              </Alert>
            ))}
          </div>
        )}

        <Form>
          <FormSection title="Question">
            <RichTextEditor
              _allRecords={_allRecords}
              initialValue={input.text.text}
              onChange={(e) => {
                console.log("onchange");
                setInput({ ...input, text: { text: e } });
              }}
              className="w-[700px]"
              label="Title"
              required
            />

            <RichTextEditor
              _allRecords={_allRecords}
              required
              initialValue={input.hint?.text ?? ""}
              onChange={(e) => setInput({ ...input, hint: { text: e } })}
              className="w-[700px]"
              label="Hint"
            />
          </FormSection>
          {input.answers.map((answer, index) => (
            <FormSection title={`Answer ${index + 1}`} key={index}>
              <RichTextEditor
                _allRecords={_allRecords}
                initialValue={answer.answerText!.text}
                onChange={(e) => {
                  answer.answerText!.text = e;
                  setInput({ ...input });
                }}
                className="w-[700px]"
                label="Text"
                required
              />

              <RichTextEditor
                _allRecords={_allRecords}
                initialValue={answer.feedback?.text}
                onChange={(e) => {
                  answer.feedback!.text = e;
                  setInput({ ...input });
                }}
                className="w-[700px]"
                label="Feedback"
                required
              />
              <div className="flex justify-between items-center w-full">
                <FormControlLabel
                  control={
                    <Checkbox
                      value={answer.correct}
                      onChange={(e) => {
                        answer.correct = !answer.correct;
                        setInput({ ...input });
                      }}
                    />
                  }
                  label="Correct"
                />
                <IconButton
                  color="error"
                  onClick={() => {
                    setInput({
                      ...input,
                      answers: input.answers.filter((_, idx) => idx !== index),
                    });
                  }}
                >
                  <Delete></Delete>
                </IconButton>
              </div>
            </FormSection>
          ))}

          <div className="flex w-full justify-end col-span-full">
            <Button
              onClick={() =>
                setInput({
                  ...input,
                  answers: [
                    ...input.answers,
                    {
                      correct: false,
                      answerText: { text: "" },
                      feedback: { text: "" },
                    },
                  ],
                })
              }
              startIcon={<Add />}
            >
              Add Answer
            </Button>
          </div>
        </Form>
      </DialogContent>
      <DialogActions>
        <div className="text-red-600 text-xs mr-3">
          {!oneAnswerCorrect && (
            <div>At least one answer has to be correct</div>
          )}
          {!atLeastTwoAnswers && <div>At least two answers are required</div>}
        </div>

        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          disabled={!valid}
          loading={isLoading || isLoadingUpd}
          onClick={handleSubmit}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
