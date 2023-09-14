import { DeleteQuestionButtonMutation } from "@/__generated__/DeleteQuestionButtonMutation.graphql";
import { Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { graphql, useMutation } from "react-relay";

export function DeleteQuestionButton({
  assessmentId,
  questionId,
  num,
}: {
  assessmentId: string;
  questionId: string;
  num: number;
}) {
  const [deleteQuestion, isDeleting] =
    useMutation<DeleteQuestionButtonMutation>(graphql`
      mutation DeleteQuestionButtonMutation(
        $assessmentId: UUID!
        $number: Int!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          removeQuestion(number: $number) {
            assessmentId
          }
        }
      }
    `);
  return (
    <IconButton
      onClick={() => {
        deleteQuestion({
          variables: { assessmentId, number: num },
          updater(store) {
            const assmnt = store.get(assessmentId);
            const quiz = assmnt?.getLinkedRecord("quiz");
            const allQuestions = quiz?.getLinkedRecords("questionPool") ?? [];

            if (!quiz) {
              console.error("not found");
              return;
            }

            quiz.setLinkedRecords(
              allQuestions.filter((x) => x.getDataID() !== questionId),
              "questionPool"
            );
          },
        });
      }}
    >
      <Delete fontSize="small"></Delete>
    </IconButton>
  );
}
