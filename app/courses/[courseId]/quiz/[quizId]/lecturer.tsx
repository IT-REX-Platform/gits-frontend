import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { Heading } from "@/components/Heading";
import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { MultipleChoiceQuestionModal } from "@/components/MultipleChoiceQuestionModal";
import { MultipleChoiceQuestionPreview } from "@/components/quiz/MultipleChoiceQuestionPreview";
import { DeleteQuestionButton } from "@/components/quiz/DeleteQuestionButton";
import { DeleteQuizButton } from "@/components/quiz/DeleteQuizButton";
import { FormErrors } from "@/components/FormErrors";
import { ClozeQuestionPreview } from "@/components/quiz/ClozeQuestionPreview";
import { EditClozeQuestionButton } from "@/components/quiz/EditClozeQuestionButton";
import { AddQuestionButton } from "@/components/quiz/AddQuestionButton";
import { PageError } from "@/components/PageError";

export default function LecturerQuiz() {
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
                ...EditClozeQuestionButtonFragment
                ... on MultipleChoiceQuestion {
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

  const [isEditOpen, setEditOpen] = useState<number | null>(null);
  const [error, setError] = useState<any>(null);

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
          <DeleteQuizButton
            chapterId={content.metadata.chapterId}
            contentId={content.id}
            onCompleted={() => router.push(`/courses/${courseId}`)}
            onError={setError}
          />
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
        </div>
      ))}
      <div className="mt-8 flex flex-col items-start">
        <AddQuestionButton _allRecords={query} assessmentId={content.id} />
      </div>

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
