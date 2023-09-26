import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useMemo, useState } from "react";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { graphql, useFragment, useMutation } from "react-relay";
import { EditMultipleChoiceQuestionButtonFragment$key } from "@/__generated__/EditMultipleChoiceQuestionButtonFragment.graphql";
import { EditMultipleChoiceQuestionButtonMutation } from "@/__generated__/EditMultipleChoiceQuestionButtonMutation.graphql";
import {
  MultipleChoiceQuestionData,
  MultipleChoiceQuestionModal,
} from "./MutlipleChoiceQuestionModal";

export function EditMultipleChoiceQuestionButton({
  _allRecords,
  _question,
  assessmentId,
}: {
  _allRecords: MediaRecordSelector$key;
  _question: EditMultipleChoiceQuestionButtonFragment$key;
  assessmentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  const question = useFragment(
    graphql`
      fragment EditMultipleChoiceQuestionButtonFragment on MultipleChoiceQuestion {
        id
        text
        hint
        answers {
          answerText
          correct
          feedback
        }
      }
    `,
    _question
  );

  const [updateQuestion, isUpdating] =
    useMutation<EditMultipleChoiceQuestionButtonMutation>(graphql`
      mutation EditMultipleChoiceQuestionButtonMutation(
        $assessmentId: UUID!
        $input: UpdateMultipleChoiceQuestionInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          updateMultipleChoiceQuestion(input: $input) {
            assessmentId
            questionPool {
              ...EditMultipleChoiceQuestionButtonFragment
            }
          }
        }
      }
    `);

  const handleSubmit = (data: MultipleChoiceQuestionData) => {
    updateQuestion({
      variables: {
        assessmentId,
        input: {
          id: question.id,
          text: data.text,
          hint: data.hint,
          answers: data.answers.map((answer) => ({
            answerText: answer.answerText,
            correct: answer.correct,
            feedback: answer.feedback,
          })),
        },
      },
      onCompleted: () => setOpen(false),
      onError: setError,
    });
  };

  const initialValue: MultipleChoiceQuestionData = useMemo(
    () => ({
      text: question.text,
      hint: question.hint,
      answers: question.answers.map((answer) => ({
        answerText: answer.answerText,
        correct: answer.correct,
        feedback: answer.feedback,
      })),
    }),
    [question]
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Edit fontSize="small"></Edit>
      </IconButton>
      <MultipleChoiceQuestionModal
        _allRecords={_allRecords}
        open={open}
        title="Edit multiple choice question"
        error={error}
        initialValue={initialValue}
        isLoading={isUpdating}
        onSave={handleSubmit}
        onClose={() => setOpen(false)}
        clearError={() => setError(null)}
      />
    </>
  );
}
