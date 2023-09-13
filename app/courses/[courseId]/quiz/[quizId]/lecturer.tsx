import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import { Heading } from "@/components/Heading";
import { Add, Edit } from "@mui/icons-material";
import { Alert, Button, IconButton } from "@mui/material";
import { default as Error } from "next/error";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { MultipleChoiceQuestionModal } from "../../../../../components/MultipleChoiceQuestionModal";
import { MultipleChoiceQuestionPreview } from "@/components/quiz/MultipleChoiceQuestionPreview";
import { DeleteQuestionButton } from "@/components/quiz/DeleteQuestionButton";
import { DeleteQuizButton } from "@/components/quiz/DeleteQuizButton";
import { FormErrors } from "@/components/FormErrors";
import { ClozeQuestionPreview } from "@/components/quiz/ClozeQuestionPreview";
import { EditClozeQuestionButton } from "@/components/quiz/EditClozeQuestionButton";

export default function EditQuiz() {
  const { quizId, courseId } = useParams();
  const router = useRouter();

  const { contentsByIds, ...query } = useLazyLoadQuery<lecturerEditQuizQuery>(
    graphql`
      query lecturerEditQuizQuery($id: UUID!) {
        ...MediaRecordSelector
        contentsByIds(ids: [$id]) {
          id
          metadata {
            name
            chapterId
          }
          ... on QuizAssessment {
            quiz {
              assessmentId
              questionPool {
                id
                type
                ...MultipleChoiceQuestionPreviewFragment
                ...ClozeQuestionPreviewFragment
                ...EditClozeQuestionButtonFragment
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
      }
    `,
    { id: quizId }
  );

  const [isAddQuizOpen, setAddQuizOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState<number | null>(null);

  const content = contentsByIds[0];
  const quiz = content.quiz;

  const [error, setError] = useState<any>(null);
  if (!quiz) {
    return <Error statusCode={400} />;
  }

  return (
    <main>
      <FormErrors error={error} onClose={() => setError(null)} />
      <Heading
        title={content.metadata.name}
        action={
          <DeleteQuizButton
            chapterId={content.metadata.chapterId}
            contentId={content.id}
            onCompleted={() => router.push(`/courses/${courseId}`)}
            onError={setError}
          />
        }
        backButton
      />

      {quiz.questionPool.map((question, index) => (
        <div
          key={question.id}
          className="my-3 py-3 border-b flex justify-between items-start"
        >
          {question.type === "MULTIPLE_CHOICE" && (
            <>
              <MultipleChoiceQuestionPreview _question={question} />
              <div className="flex">
                <IconButton
                  onClick={() => {
                    setEditOpen(index);
                  }}
                >
                  <Edit fontSize="small"></Edit>
                </IconButton>
                <DeleteQuestionButton
                  assessmentId={content.id}
                  questionId={question.id}
                  num={question.number!}
                />
              </div>
            </>
          )}
          {question.type === "CLOZE" && (
            <>
              <ClozeQuestionPreview _question={question} />
              <div className="flex">
                <EditClozeQuestionButton
                  _allRecords={query}
                  _question={question}
                  assessmentId={content.id}
                />
                <DeleteQuestionButton
                  assessmentId={content.id}
                  questionId={question.id}
                  num={question.number!}
                />
              </div>
            </>
          )}
        </div>
      ))}
      <div className="mt-8 flex flex-col gap-6">
        <div>
          <Button startIcon={<Add />} onClick={() => setAddQuizOpen(true)}>
            Add quiz question
          </Button>
        </div>
      </div>

      <MultipleChoiceQuestionModal
        _allRecords={query}
        assessmentId={quiz.assessmentId}
        contentId={content.id}
        onClose={() => setAddQuizOpen(false)}
        open={isAddQuizOpen}
      />
      <MultipleChoiceQuestionModal
        _allRecords={query}
        key={isEditOpen}
        assessmentId={quiz.assessmentId}
        contentId={content.id}
        onClose={() => setEditOpen(null)}
        open={isEditOpen !== null}
        existingQuestion={
          isEditOpen !== null ? quiz.questionPool[isEditOpen] : undefined
        }
      />
    </main>
  );
}
