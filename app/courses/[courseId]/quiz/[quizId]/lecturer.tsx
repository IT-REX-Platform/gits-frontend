import { lecturerDeleteMultipleChoiceQuestionMutation } from "@/__generated__/lecturerDeleteMultipleChoiceQuestionMutation.graphql";
import { lecturerDeleteQuizContentMutation } from "@/__generated__/lecturerDeleteQuizContentMutation.graphql";
import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import { Heading } from "@/components/Heading";
import { RenderRichText } from "@/components/RichTextEditor";
import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  IconButton,
} from "@mui/material";
import { default as Error } from "next/error";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { MultipleChoiceQuestionModal } from "../../../../../components/MultipleChoiceQuestionModal";

export default function EditQuiz() {
  const { quizId, courseId } = useParams();
  const [del, deleting] =
    useMutation<lecturerDeleteQuizContentMutation>(graphql`
      mutation lecturerDeleteQuizContentMutation($id: UUID!) {
        mutateContent(contentId: $id) {
          deleteContent
        }
      }
    `);

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

  const [deleteQuestion, isDeleting] =
    useMutation<lecturerDeleteMultipleChoiceQuestionMutation>(graphql`
      mutation lecturerDeleteMultipleChoiceQuestionMutation(
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
  if (!quiz) {
    return <Error statusCode={400} />;
  }

  return (
    <main>
      <Heading
        title={content.metadata.name}
        action={
          <div className="flex gap-2">
            <Button
              sx={{ color: "text.secondary" }}
              startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
              onClick={() => {
                if (
                  confirm(
                    "Do you really want to delete this quiz? This can't be undone."
                  )
                ) {
                  del({
                    variables: { id: content.id },
                    onCompleted() {
                      router.push(`/courses/${courseId}`);
                    },
                    onError(error) {
                      setError(error);
                    },
                    updater(store) {
                      const chapter = store.get(content.metadata.chapterId);
                      const contents = chapter?.getLinkedRecords("contents");
                      if (chapter && contents) {
                        chapter.setLinkedRecords(
                          contents.filter((x) => x.getDataID() !== content.id),
                          "contents"
                        );
                      }
                    },
                  });
                }
              }}
            >
              Delete
            </Button>
          </div>
        }
        backButton
      />
      {error && (
        <div className="flex flex-col gap-2 mt-8">
          {error?.source?.errors.map((err: any, i: number) => (
            <Alert key={i} severity="error" onClose={() => setError(null)}>
              {err.message}
            </Alert>
          ))}
        </div>
      )}

      {quiz.questionPool.map((question, index) => (
        <div key={question.id} className="my-3 py-3 border-b">
          <div className="flex items-center justify-between w-full">
            <RenderRichText value={question.text}></RenderRichText>
            <div className="flex">
              <IconButton
                onClick={() => {
                  setEditOpen(index);
                }}
              >
                <Edit fontSize="small"></Edit>
              </IconButton>
              <IconButton
                onClick={() => {
                  deleteQuestion({
                    variables: {
                      assessmentId: quiz.assessmentId,
                      number: question.number!,
                    },
                    updater(store) {
                      const ctnt = store.get(content.id);
                      const quiz = ctnt?.getLinkedRecord("quiz");
                      const allQuestions =
                        quiz?.getLinkedRecords("questionPool") ?? [];

                      if (!quiz) {
                        console.error("not found");
                        return;
                      }

                      quiz.setLinkedRecords(
                        allQuestions.filter(
                          (x) => x.getDataID() !== question.id
                        ),
                        "questionPool"
                      );
                    },
                  });
                }}
              >
                <Delete fontSize="small"></Delete>
              </IconButton>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex justify-center gap-4">
              <FormGroup>
                {question.answers!.map((answer, index) => (
                  <div key={index}>
                    <FormControlLabel
                      sx={{ cursor: "default" }}
                      control={
                        <Checkbox
                          sx={{ cursor: "default" }}
                          disableRipple
                          checked={answer.correct}
                        />
                      }
                      label={
                        <RenderRichText
                          value={answer.answerText}
                        ></RenderRichText>
                      }
                    />
                  </div>
                ))}
              </FormGroup>
            </div>
          </div>
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
