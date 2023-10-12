"use client";
import { QuizModalEditMutation } from "@/__generated__/QuizModalEditMutation.graphql";
import { QuizModalFragment$key } from "@/__generated__/QuizModalFragment.graphql";
import {
  CreateQuizInput,
  QuestionPoolingMode,
  QuizModalMutation,
} from "@/__generated__/QuizModalMutation.graphql";
import { Form, FormSection } from "@/components/Form";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "./AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "./ContentMetadataFormSection";

const defaultInput = {
  questionPoolingMode: "RANDOM",
  requiredCorrectAnswers: 4,
  numberOfRandomlySelectedQuestions: 5,
} as const;

export function QuizModal({
  onClose: _onClose,
  chapterId,
  isOpen,
  _existingQuiz,
}: {
  onClose: () => void;
  isOpen: boolean;
  chapterId: string;
  _existingQuiz: QuizModalFragment$key | null;
}) {
  const existingQuiz = useFragment(
    graphql`
      fragment QuizModalFragment on Quiz {
        assessmentId
        content {
          id
          ... on QuizAssessment {
            assessmentMetadata {
              initialLearningInterval
              skillPoints
              skillTypes
            }
          }
          metadata {
            name
            rewardPoints
            suggestedDate
            tagNames
            chapterId
          }
        }
        requiredCorrectAnswers
        numberOfRandomlySelectedQuestions
        questionPoolingMode
      }
    `,
    _existingQuiz
  );

  const assessment = existingQuiz?.content!;

  const [input, setInput] = useState<CreateQuizInput>(
    existingQuiz
      ? {
          questionPoolingMode: existingQuiz.questionPoolingMode,
          requiredCorrectAnswers: existingQuiz.requiredCorrectAnswers,
          numberOfRandomlySelectedQuestions:
            existingQuiz.numberOfRandomlySelectedQuestions,
        }
      : defaultInput
  );

  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(
    existingQuiz
      ? {
          name: assessment!.metadata!.name,
          rewardPoints: assessment!.metadata!.rewardPoints,
          suggestedDate: assessment!.metadata!.suggestedDate,
          tagNames: assessment!.metadata!.tagNames,
        }
      : null
  );
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(
      existingQuiz
        ? {
            skillPoints: assessment!.assessmentMetadata!.skillPoints,
            skillTypes: assessment!.assessmentMetadata!.skillTypes,
            initialLearningInterval:
              assessment!.assessmentMetadata!.initialLearningInterval,
          }
        : null
    );

  const [mutate, loading] = useMutation<QuizModalMutation>(graphql`
    mutation QuizModalMutation(
      $quizInput: CreateQuizInput!
      $assessmentInput: CreateAssessmentInput!
    ) {
      createQuizAssessment(
        assessmentInput: $assessmentInput
        quizInput: $quizInput
      ) {
        id
        ...ContentLinkFragment
      }
    }
  `);

  const [edit, editLoading] = useMutation<QuizModalEditMutation>(graphql`
    mutation QuizModalEditMutation(
      $contentId: UUID!
      $assessmentId: UUID!
      $assessmentInput: UpdateAssessmentInput!
      $questionPoolingMode: QuestionPoolingMode!
      $numberOfRandomlySelectedQuestions: Int!
      $requiredCorrectAnswers: Int!
    ) {
      mutateContent(contentId: $contentId) {
        updateAssessment(input: $assessmentInput) {
          ...ContentLinkFragment
          metadata {
            name
            rewardPoints
            suggestedDate
            tagNames
          }
        }
      }
      mutateQuiz(assessmentId: $assessmentId) {
        setQuestionPoolingMode(questionPoolingMode: $questionPoolingMode) {
          questionPoolingMode
        }
        setNumberOfRandomlySelectedQuestions(
          numberOfRandomlySelectedQuestions: $numberOfRandomlySelectedQuestions
        ) {
          numberOfRandomlySelectedQuestions
        }
        setRequiredCorrectAnswers(
          requiredCorrectAnswers: $requiredCorrectAnswers
        ) {
          requiredCorrectAnswers
        }
      }
    }
  `);

  const [error, setError] = useState<any>(null);

  const valid =
    metadata &&
    assessmentMetadata &&
    input.requiredCorrectAnswers > 0 &&
    (input.questionPoolingMode !== "RANDOM" ||
      (input.numberOfRandomlySelectedQuestions ?? 0) > 0);

  function onClose() {
    setInput(
      existingQuiz
        ? {
            questionPoolingMode: existingQuiz.questionPoolingMode,
            requiredCorrectAnswers: existingQuiz.requiredCorrectAnswers,
            numberOfRandomlySelectedQuestions:
              existingQuiz.numberOfRandomlySelectedQuestions,
          }
        : defaultInput
    );
    _onClose();
  }

  function handleSubmit() {
    if (!valid) {
      return;
    }
    if (existingQuiz) {
      edit({
        variables: {
          assessmentId: assessment!.id!,
          assessmentInput: {
            assessmentMetadata,
            metadata: {
              ...metadata,
              chapterId: assessment!.metadata!.chapterId,
            },
          },
          contentId: assessment!.id!,
          numberOfRandomlySelectedQuestions:
            input.numberOfRandomlySelectedQuestions ?? 1,
          questionPoolingMode: input.questionPoolingMode!,
          requiredCorrectAnswers: input.requiredCorrectAnswers!,
        },
        onCompleted() {
          onClose();
        },
        onError: setError,

        updater(store) {
          store.get(assessment!.id!)?.invalidateRecord();
        },
      });
    } else {
      mutate({
        variables: {
          quizInput: {
            ...input,
            numberOfRandomlySelectedQuestions:
              input.questionPoolingMode === "ORDERED"
                ? null
                : input.numberOfRandomlySelectedQuestions,
          },
          assessmentInput: {
            metadata: { ...metadata!, type: "QUIZ", chapterId },
            assessmentMetadata: assessmentMetadata!,
          },
        },
        onCompleted() {
          onClose();
        },
        onError: setError,
        updater(store, data) {
          // Get record of chapter and of the new assignment
          const chapterRecord = store.get(chapterId);
          const newRecord = store.get(data.createQuizAssessment.id);

          if (!chapterRecord || !newRecord) return;

          // Update the linked records of the chapter contents
          const contentRecords =
            chapterRecord.getLinkedRecords("contents") ?? [];
          chapterRecord.setLinkedRecords(
            [...contentRecords, newRecord],
            "contents"
          );
        },
      });
    }
  }

  return (
    <Dialog maxWidth="lg" open={isOpen} onClose={onClose}>
      <DialogTitle>Add Quiz</DialogTitle>
      <DialogContent>
        {error?.source.errors.map((err: any, i: number) => (
          <Alert key={i} severity="error" onClose={() => setError(null)}>
            {err.message}
          </Alert>
        ))}
        <Form>
          <ContentMetadataFormSection
            metadata={metadata}
            onChange={setMetadata}
          />

          <AssessmentMetadataFormSection
            metadata={assessmentMetadata}
            onChange={setAssessmentMetadata}
          />

          <FormSection title="Scoring">
            <TextField
              value={input.requiredCorrectAnswers}
              onChange={(e) =>
                setInput({
                  ...input,
                  requiredCorrectAnswers: Number(e.target.value),
                })
              }
              error={input.requiredCorrectAnswers <= 0}
              helperText={
                input.requiredCorrectAnswers <= 0
                  ? "Must be greater than 0"
                  : undefined
              }
              className="w-96"
              label="Required correct answers"
              variant="outlined"
              required
              type="number"
            />

            <Select
              className="min-w-[8rem]"
              label="Question selection"
              value={input.questionPoolingMode}
              onChange={(e) =>
                setInput({
                  ...input,
                  questionPoolingMode: e.target.value as QuestionPoolingMode,
                })
              }
              required
            >
              <MenuItem value="RANDOM">Random</MenuItem>
              <MenuItem value="ORDERED">Ordered</MenuItem>
            </Select>

            {input.questionPoolingMode === "RANDOM" && (
              <TextField
                value={input.numberOfRandomlySelectedQuestions}
                onChange={(e) =>
                  setInput({
                    ...input,
                    numberOfRandomlySelectedQuestions: Number(e.target.value),
                  })
                }
                className="w-96"
                label="Number of randomly selected questions"
                variant="outlined"
                error={(input.numberOfRandomlySelectedQuestions ?? 0) <= 0}
                helperText={
                  input.requiredCorrectAnswers <= 0
                    ? "Must be greater than 0"
                    : undefined
                }
                required
                type="number"
              />
            )}
          </FormSection>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          loading={loading || editLoading}
          disabled={!valid}
          onClick={handleSubmit}
        >
          {existingQuiz ? "Save" : "Add"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
