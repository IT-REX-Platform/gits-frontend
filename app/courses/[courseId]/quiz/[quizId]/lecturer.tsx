import { lecturerDeleteQuizContentMutation } from "@/__generated__/lecturerDeleteQuizContentMutation.graphql";
import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import {
  CreateMultipleChoiceQuestionInput,
  lecturerQuizAddMultipleChoiceQuestionMutation,
} from "@/__generated__/lecturerQuizAddMultipleChoiceQuestionMutation.graphql";
import { Form, FormSection } from "@/components/Form";
import { Heading } from "@/components/Heading";
import { ResourceMarkdownEditor } from "@/components/ResourceMarkdownEditor";
import { Add, Delete, Edit } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  TextField,
  Typography,
} from "@mui/material";
import { default as Error } from "next/error";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

export default function EditQuiz() {
  const { quizId, courseId } = useParams();
  const [del, deleting] =
    useMutation<lecturerDeleteQuizContentMutation>(graphql`
      mutation lecturerDeleteQuizContentMutation($id: UUID!) {
        deleteContent(id: $id)
      }
    `);

  const router = useRouter();

  const { contentsByIds } = useLazyLoadQuery<lecturerEditQuizQuery>(
    graphql`
      query lecturerEditQuizQuery($id: UUID!) {
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
                  text {
                    text
                  }
                  hint {
                    text
                  }
                  answers {
                    correct
                    feedback {
                      text
                    }
                    answerText {
                      text
                    }
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
  const [isEditSetOpen, setEditSetOpen] = useState(false);

  const content = contentsByIds[0];
  const quiz = content.quiz;

  if (!quiz) {
    return <Error statusCode={400} />;
  }

  const [error, setError] = useState<any>(null);

  const [deleteQuestion, isDeleting] = useMutation(graphql`
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
      {error && (
        <div className="flex flex-col gap-2 mt-8">
          {error?.source?.errors.map((err: any, i: number) => (
            <Alert key={i} severity="error" onClose={() => setError(null)}>
              {err.message}
            </Alert>
          ))}
        </div>
      )}

      {quiz.questionPool.map((question) => (
        <div>
          <Typography variant="overline" color="textSecondary">
            {question.text!.text}
          </Typography>
          <div className="flex flex-wrap gap-2">
            <div className="flex justify-center gap-4">
              <FormGroup>
                {question.answers!.map((answer, index) => (
                  <div key={index}>
                    <FormControlLabel
                      control={<Checkbox />}
                      label={answer.answerText.text}
                    />
                  </div>
                ))}
              </FormGroup>
            </div>
          </div>
          {/* <Button
            sx={{ marginTop: 1 }}
            startIcon={<Add />}
            onClick={() => setAddSideOpen(true)}
          >
            Add side
          </Button> */}
        </div>
      ))}
      <div className="mt-8 flex flex-col gap-6">
        <div>
          <Button startIcon={<Add />} onClick={() => setAddQuizOpen(true)}>
            Add quiz question
          </Button>
        </div>
      </div>

      <AddMultipleChoiceQuestionModal
        assessmentId={quiz.assessmentId}
        onClose={() => setAddQuizOpen(false)}
        open={isAddQuizOpen}
      />
    </main>
  );
}

function AddMultipleChoiceQuestionModal({
  open,
  onClose,
  assessmentId,
}: {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
}) {
  const [error, setError] = useState<any>(null);

  const [addQuestion, isLoading] =
    useMutation<lecturerQuizAddMultipleChoiceQuestionMutation>(graphql`
      mutation lecturerQuizAddMultipleChoiceQuestionMutation(
        $input: CreateMultipleChoiceQuestionInput!
        $assessmentId: UUID!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          addMultipleChoiceQuestion(input: $input) {
            assessmentId
          }
        }
      }
    `);

  const defaultValues = {
    answers: [],
    text: { text: "" },
    hint: { text: "" },
  };

  const [input, setInput] =
    useState<CreateMultipleChoiceQuestionInput>(defaultValues);

  const handleSubmit = () => {
    addQuestion({
      variables: { input, assessmentId },
      onCompleted() {
        setInput(defaultValues);
        onClose();
      },
      onError: setError,
    });
  };

  return (
    <Dialog open={open} maxWidth="lg" onClose={onClose}>
      <DialogTitle>Add multiple choice question</DialogTitle>
      <DialogContent>
        {error && (
          <div className="flex flex-col gap-2 mt-8">
            {error?.source?.errors.map((err: any, i: number) => (
              <Alert key={i} severity="error" onClose={() => setError(null)}>
                {err.message}
              </Alert>
            ))}
          </div>
        )}

        <Form>
          <FormSection title="Question">
            <TextField
              value={input.text}
              onChange={(e) =>
                setInput({ ...input, text: { text: e.target.value } })
              }
              className="w-96"
              label="Title"
              variant="outlined"
              required
            />

            <TextField
              value={input.hint}
              onChange={(e) =>
                setInput({ ...input, hint: { text: e.target.value } })
              }
              className="w-96"
              label="Hint"
              variant="outlined"
              required
            />
          </FormSection>
          {input.answers.map((answer, index) => (
            <FormSection title={`Answer ${index + 1}`}>
              <TextField
                value={answer.answerText!.text}
                onChange={(e) => {
                  answer.answerText!.text = e.target.value;
                  setInput({ ...input });
                }}
                className="w-96"
                label="Text"
                variant="outlined"
                required
              />
              <TextField
                value={answer.feedback}
                onChange={(e) => {
                  answer.feedback!.text = e.target.value;
                  setInput({ ...input });
                }}
                className="w-96"
                label="Feedback"
                variant="outlined"
                required
              />
              <FormControlLabel
                control={
                  <Checkbox
                    value={answer.correct}
                    onChange={(e) => {
                      answer.correct = !!e.target.value;
                      setInput({ ...input });
                    }}
                  />
                }
                label="Correct"
              />
            </FormSection>
          ))}

          <ResourceMarkdownEditor />
          <div className="flex w-full justify-end col-span-full">
            <Button
              onClick={() =>
                setInput({
                  ...input,
                  answers: [
                    ...input.answers,
                    {
                      correct: false,
                      answerText: { text: "" },
                      feedback: { text: "" },
                    },
                  ],
                })
              }
              startIcon={<Add />}
            >
              Add Answer
            </Button>
          </div>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button disabled={isLoading} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton loading={isLoading} onClick={handleSubmit}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
