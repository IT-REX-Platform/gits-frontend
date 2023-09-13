import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useMemo, useState } from "react";
import {
  ClozeElementData,
  ClozeQuestionData,
  ClozeQuestionModal,
} from "./ClozeQuestionModal";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { graphql, useFragment, useMutation } from "react-relay";
import { EditClozeQuestionButtonFragment$key } from "@/__generated__/EditClozeQuestionButtonFragment.graphql";
import { EditClozeQuestionButtonMutation } from "@/__generated__/EditClozeQuestionButtonMutation.graphql";

export function EditClozeQuestionButton({
  _allRecords,
  _question,
  assessmentId,
}: {
  _allRecords: MediaRecordSelector$key;
  _question: EditClozeQuestionButtonFragment$key;
  assessmentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<any>(null);

  const question = useFragment(
    graphql`
      fragment EditClozeQuestionButtonFragment on ClozeQuestion {
        id
        showBlanksList
        additionalWrongAnswers
        clozeElements {
          __typename
          ... on ClozeTextElement {
            text {
              text
            }
          }
          ... on ClozeBlankElement {
            correctAnswer
            feedback {
              text
            }
          }
        }
      }
    `,
    _question
  );

  const [updateQuestion, isUpdating] =
    useMutation<EditClozeQuestionButtonMutation>(graphql`
      mutation EditClozeQuestionButtonMutation(
        $assessmentId: UUID!
        $input: UpdateClozeQuestionInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          updateClozeQuestion(input: $input) {
            assessmentId
            questionPool {
              ...EditClozeQuestionButtonFragment
            }
          }
        }
      }
    `);

  const handleSubmit = (data: ClozeQuestionData) => {
    updateQuestion({
      variables: {
        assessmentId,
        input: {
          id: question.id,
          showBlanksList: data.showBlanksList,
          additionalWrongAnswers: data.additionalWrongAnswers,
          clozeElements: data.clozeElements.map((elem) =>
            elem.type === "text"
              ? { type: "TEXT", text: { text: elem.text } }
              : {
                  type: "BLANK",
                  correctAnswer: elem.correctAnswer,
                  feedback: { text: elem.feedback },
                }
          ),
        },
      },
    });
  };

  const initialValue: ClozeQuestionData = useMemo(
    () => ({
      showBlanksList: question.showBlanksList,
      additionalWrongAnswers: [...question.additionalWrongAnswers],
      clozeElements: question.clozeElements
        .map((elem) =>
          elem.__typename === "ClozeTextElement"
            ? { type: "text", text: elem.text.text }
            : elem.__typename === "ClozeBlankElement"
            ? {
                type: "blank",
                correctAnswer: elem.correctAnswer,
                feedback: elem.feedback?.text ?? "",
              }
            : null
        )
        .filter((elem) => elem !== null) as ClozeElementData[],
    }),
    [question]
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Edit fontSize="small"></Edit>
      </IconButton>
      <ClozeQuestionModal
        _allRecords={_allRecords}
        open={open}
        title="Edit cloze question"
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
