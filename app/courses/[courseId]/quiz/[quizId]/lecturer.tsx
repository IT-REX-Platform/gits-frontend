import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { Heading } from "@/components/Heading";
import { default as Error } from "next/error";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { MultipleChoiceQuestionPreview } from "@/components/quiz/MultipleChoiceQuestionPreview";
import { DeleteQuestionButton } from "@/components/quiz/DeleteQuestionButton";
import { DeleteQuizButton } from "@/components/quiz/DeleteQuizButton";
import { FormErrors } from "@/components/FormErrors";
import { ClozeQuestionPreview } from "@/components/quiz/ClozeQuestionPreview";
import { EditClozeQuestionButton } from "@/components/quiz/EditClozeQuestionButton";
import { AddQuestionButton } from "@/components/quiz/AddQuestionButton";
import { EditMultipleChoiceQuestionButton } from "@/components/quiz/EditMultipleChoiceQuestionButton";

export default function EditQuiz() {
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
                ...EditClozeQuestionButtonFragment
              }
            }
          }
        }
      }
    `,
    { id: quizId }
  );

  const content = contentsByIds[0];
  const quiz = content.quiz;

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
    </main>
  );
}
