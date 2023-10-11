import { useState } from "react";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { graphql, useMutation } from "react-relay";
import { AddMultipleChoiceQuestionModalMutation } from "@/__generated__/AddMultipleChoiceQuestionModalMutation.graphql";
import {
  MultipleChoiceQuestionData,
  MultipleChoiceQuestionModal,
} from "./MutlipleChoiceQuestionModal";

export function AddMultipleChoiceQuestionModal({
  _allRecords,
  assessmentId,
  open,
  onClose,
}: {
  _allRecords: MediaRecordSelector$key;
  assessmentId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [error, setError] = useState<any>(null);

  const [addQuestion, isUpdating] =
    useMutation<AddMultipleChoiceQuestionModalMutation>(graphql`
      mutation AddMultipleChoiceQuestionModalMutation(
        $assessmentId: UUID!
        $input: CreateMultipleChoiceQuestionInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          addMultipleChoiceQuestion(input: $input) {
            assessmentId
            questionPool {
              id
              type # without type and number, the question will not appear properly and be deletable until a page reload
              number
              ...EditMultipleChoiceQuestionButtonFragment
              ...MultipleChoiceQuestionPreviewFragment
            }
          }
        }
      }
    `);

  const handleSubmit = (data: MultipleChoiceQuestionData) => {
    addQuestion({
      variables: {
        assessmentId,
        input: {
          text: data.text,
          hint: data.hint,
          answers: data.answers.map((answer) => ({
            answerText: answer.answerText,
            correct: answer.correct,
            feedback: answer.feedback,
          })),
        },
      },
      onCompleted: () => onClose(),
      updater(
        store,
        {
          mutateQuiz: {
            addMultipleChoiceQuestion: { questionPool },
          },
        }
      ) {
        const content = store.get(assessmentId);
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

  const initialValue: MultipleChoiceQuestionData = {
    text: "",
    hint: null,
    answers: [],
  };

  return (
    <MultipleChoiceQuestionModal
      _allRecords={_allRecords}
      open={open}
      title="Add multiple choice question"
      error={error}
      initialValue={initialValue}
      isLoading={isUpdating}
      onSave={handleSubmit}
      onClose={onClose}
      clearError={() => setError(null)}
    />
  );
}
