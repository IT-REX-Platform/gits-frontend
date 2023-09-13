import { useState } from "react";
import { ClozeQuestionData, ClozeQuestionModal } from "./ClozeQuestionModal";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { graphql, useMutation } from "react-relay";
import { AddClozeQuestionModalMutation } from "@/__generated__/AddClozeQuestionModalMutation.graphql";

export function AddClozeQuestionModal({
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
    useMutation<AddClozeQuestionModalMutation>(graphql`
      mutation AddClozeQuestionModalMutation(
        $assessmentId: UUID!
        $input: CreateClozeQuestionInput!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          addClozeQuestion(input: $input) {
            assessmentId
            questionPool {
              id
              type # without type and number, the question will not appear properly and be deletable until a page reload
              number
              ...EditClozeQuestionButtonFragment
              ...ClozeQuestionPreviewFragment
            }
          }
        }
      }
    `);

  const handleSubmit = (data: ClozeQuestionData) => {
    addQuestion({
      variables: {
        assessmentId,
        input: {
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
      onCompleted: () => onClose(),
      updater(
        store,
        {
          mutateQuiz: {
            addClozeQuestion: { questionPool },
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

  const initialValue: ClozeQuestionData = {
    showBlanksList: true,
    additionalWrongAnswers: [],
    clozeElements: [],
  };

  return (
    <ClozeQuestionModal
      _allRecords={_allRecords}
      open={open}
      title="Edit cloze question"
      error={error}
      initialValue={initialValue}
      isLoading={isUpdating}
      onSave={handleSubmit}
      onClose={onClose}
      clearError={() => setError(null)}
    />
  );
}
