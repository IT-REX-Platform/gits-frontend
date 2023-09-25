import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import {
  AssociationQuestionData,
  AssociationQuestionModal,
} from "./AssociationQuestionModal";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import { AddAssociationQuestionModalMutation } from "@/__generated__/AddAssociationQuestionModalMutation.graphql";

export function AddAssociationQuestionModal({
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
    useMutation<AddAssociationQuestionModalMutation>(graphql`
      mutation AddAssociationQuestionModalMutation(
        $assessmentId: UUID!
        $input: CreateAssociationQuestionInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          addAssociationQuestion(input: $input) {
            assessmentId
            questionPool {
              id
              type # without type and number, the question will not appear properly and be deletable until a page reload
              number
              ...AssociationQuestionPreviewFragment
            }
          }
        }
      }
    `);

  const handleSubmit = (data: AssociationQuestionData) => {
    addQuestion({
      variables: {
        assessmentId,
        input: {
          text: data.text,
          hint: data.hint,
          correctAssociations: data.correctAssociations,
        },
      },
      onCompleted: () => onClose(),
      onError: setError,
      updater(
        store,
        {
          mutateQuiz: {
            addAssociationQuestion: { questionPool },
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
    });
  };

  const initialValue: AssociationQuestionData = {
    text: "",
    hint: null,
    correctAssociations: [],
  };

  return (
    <AssociationQuestionModal
      _allRecords={_allRecords}
      open={open}
      title="Add association question"
      error={error}
      initialValue={initialValue}
      isLoading={isUpdating}
      onSave={handleSubmit}
      onClose={onClose}
      clearError={() => setError(null)}
    />
  );
}
