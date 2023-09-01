"use client";
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
import { graphql, useMutation } from "react-relay";
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
}: {
  onClose: () => void;
  isOpen: boolean;
  chapterId: string;
}) {
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
        ...ContentQuizFragment
      }
    }
  `);

  const [input, setInput] = useState<CreateQuizInput>(defaultInput);

  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(null);

  const [error, setError] = useState<any>(null);

  const valid = metadata && assessmentMetadata;

  function onClose() {
    setInput(defaultInput);
    _onClose();
  }

  function handleSubmit() {
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
          metadata: { ...metadata!, type: "QUIZ", chapterId, tagNames: [] },
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
        const contentRecords = chapterRecord.getLinkedRecords("contents") ?? [];
        chapterRecord.setLinkedRecords(
          [...contentRecords, newRecord],
          "contents"
        );
      },
    });
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
          loading={loading}
          disabled={!valid}
          onClick={handleSubmit}
        >
          Add
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
