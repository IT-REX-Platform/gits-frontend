import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { FormErrors } from "@/components/FormErrors";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { QuizModal } from "@/components/QuizModal";
import { AddQuestionButton } from "@/components/quiz/AddQuestionButton";
import { AssociationQuestionPreview } from "@/components/quiz/AssociationQuestionPreview";
import { ClozeQuestionPreview } from "@/components/quiz/ClozeQuestionPreview";
import { DeleteQuestionButton } from "@/components/quiz/DeleteQuestionButton";
import { DeleteQuizButton } from "@/components/quiz/DeleteQuizButton";
import { EditAssociationQuestionButton } from "@/components/quiz/EditAssociationQuestionButton";
import { EditClozeQuestionButton } from "@/components/quiz/EditClozeQuestionButton";
import { EditMultipleChoiceQuestionButton } from "@/components/quiz/EditMultipleChoiceQuestionButton";
import { MultipleChoiceQuestionPreview } from "@/components/quiz/MultipleChoiceQuestionPreview";
import { Edit } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function LecturerQuiz() {
  const { quizId, courseId } = useParams();
  const router = useRouter();
  const [error, setError] = useState<any>(null);

  const { contentsByIds, ...query } = useLazyLoadQuery<lecturerEditQuizQuery>(
    graphql`
      query lecturerEditQuizQuery($id: UUID!) {
        ...MediaRecordSelector
        contentsByIds(ids: [$id]) {
          id
          metadata {
            name
            chapterId
            ...ContentTags
          }
          ... on QuizAssessment {
            quiz {
              assessmentId
              questionPool {
                id
                type
                number
                ...MultipleChoiceQuestionPreviewFragment
                ...ClozeQuestionPreviewFragment
                ...EditMultipleChoiceQuestionButtonFragment
                ...AssociationQuestionPreviewFragment
                ...EditClozeQuestionButtonFragment
                ...EditAssociationQuestionButtonFragment
              }
              ...QuizModalFragment
            }
          }
        }
      }
    `,
    { id: quizId }
  );
  const [isEditSetOpen, setEditSetOpen] = useState(false);

  const content = contentsByIds[0];
  if (!content) {
    return <PageError message="No quiz found with given id." />;
  }

  const quiz = content.quiz;
  if (!quiz) {
    return (
      <PageError
        title={contentsByIds[0].metadata.name}
        message="Content not of type quiz."
      />
    );
  }

  return (
    <main>
      <FormErrors error={error} onClose={() => setError(null)} />
      <Heading
        title={content.metadata.name}
        action={
          <div className="flex gap-2">
            <DeleteQuizButton
              chapterId={content.metadata.chapterId}
              contentId={content.id}
              onCompleted={() => router.push(`/courses/${courseId}`)}
              onError={setError}
            />
            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={() => setEditSetOpen(true)}
            >
              Edit
            </Button>
          </div>
        }
        backButton
      />
      <ContentTags metadata={content.metadata} />

      {quiz.questionPool.map((question, index) => (
        <div
          key={question.id}
          className="my-3 py-3 border-b flex justify-between items-start"
        >
          {question.type === "MULTIPLE_CHOICE" && (
            <>
              <MultipleChoiceQuestionPreview _question={question} />
              <div className="flex">
                <EditMultipleChoiceQuestionButton
                  _allRecords={query}
                  _question={question}
                  assessmentId={content.id!}
                />
                <DeleteQuestionButton
                  assessmentId={content.id!}
                  questionId={question.id}
                  num={question.number}
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
                  num={question.number}
                />
              </div>
            </>
          )}
          {question.type === "ASSOCIATION" && (
            <>
              <AssociationQuestionPreview _question={question} />
              <div className="flex">
                <EditAssociationQuestionButton
                  _allRecords={query}
                  _question={question}
                  assessmentId={content.id}
                />
                <DeleteQuestionButton
                  assessmentId={content.id}
                  questionId={question.id}
                  num={question.number}
                />
              </div>
            </>
          )}
        </div>
      ))}
      <div className="mt-8 flex flex-col items-start">
        <AddQuestionButton _allRecords={query} assessmentId={content.id} />
      </div>

      <QuizModal
        onClose={() => setEditSetOpen(false)}
        isOpen={isEditSetOpen}
        _existingQuiz={quiz}
        chapterId={content.metadata.chapterId}
      />
    </main>
  );
}
