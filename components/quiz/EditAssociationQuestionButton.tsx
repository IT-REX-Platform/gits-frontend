import { EditAssociationQuestionButtonFragment$key } from "@/__generated__/EditAssociationQuestionButtonFragment.graphql";
import { EditAssociationQuestionButtonMutation } from "@/__generated__/EditAssociationQuestionButtonMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useMemo, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import {
  AssociationQuestionData,
  AssociationQuestionModal,
} from "./AssociationQuestionModal";

export function EditAssociationQuestionButton({
  _allRecords,
  _question,
  assessmentId,
}: {
  _allRecords: MediaRecordSelector$key;
  _question: EditAssociationQuestionButtonFragment$key;
  assessmentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  const question = useFragment(
    graphql`
      fragment EditAssociationQuestionButtonFragment on AssociationQuestion {
        id
        text
        hint
        correctAssociations {
          left
          right
          feedback
        }
      }
    `,
    _question
  );

  const [updateQuestion, isUpdating] =
    useMutation<EditAssociationQuestionButtonMutation>(graphql`
      mutation EditAssociationQuestionButtonMutation(
        $assessmentId: UUID!
        $input: UpdateAssociationQuestionInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          updateAssociationQuestion(input: $input) {
            assessmentId
            questionPool {
              ...EditAssociationQuestionButtonFragment
            }
          }
        }
      }
    `);

  const handleSubmit = (data: AssociationQuestionData) => {
    updateQuestion({
      variables: {
        assessmentId,
        input: {
          id: question.id,
          text: data.text,
          hint: data.hint,
          correctAssociations: data.correctAssociations,
        },
      },
      updater: (store) => store.invalidateStore(),
      onCompleted: () => setOpen(false),
      onError: setError,
    });
  };

  const initialValue: AssociationQuestionData = useMemo(
    () => ({
      text: question.text,
      hint: question.hint,
      correctAssociations: question.correctAssociations.map((elem) => ({
        left: elem.left,
        right: elem.right,
        feedback: elem.feedback,
      })),
    }),
    [question]
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Edit fontSize="small"></Edit>
      </IconButton>
      <AssociationQuestionModal
        _allRecords={_allRecords}
        open={open}
        title="Edit association question"
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
