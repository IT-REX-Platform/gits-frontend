"use client";

import { studentQuizQuery } from "@/__generated__/studentQuizQuery.graphql";
import {
  QuestionCompletedInput,
  studentQuizTrackCompletedMutation,
} from "@/__generated__/studentQuizTrackCompletedMutation.graphql";
import { Heading } from "@/components/Heading";
import { RenderRichText } from "@/components/RichTextEditor";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Typography,
} from "@mui/material";
import Error from "next/error";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

type UserAnswers = (number | null)[];

export default function StudentQuiz() {
  // Get course id from url
  const { quizId, courseId } = useParams();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [checkAnswers, setCheckAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    // Reset user answers when the currentIndex changes
    setUserAnswers([]);
    setUsedHint(false);
  }, [currentIndex]);

  const [trackCompleted, loading] =
    useMutation<studentQuizTrackCompletedMutation>(
      graphql`
        mutation studentQuizTrackCompletedMutation(
          $input: QuizCompletedInput!
        ) {
          logQuizCompleted(input: $input) {
            assessment {
              userProgressData {
                lastLearnDate
                nextLearnDate
              }
            }
          }
        }
      `
    );

  const [completedInput, setCompletedInput] = useState<
    QuestionCompletedInput[]
  >([]);

  // Fetch quiz data
  const { contentsByIds } = useLazyLoadQuery<studentQuizQuery>(
    graphql`
      query studentQuizQuery($id: [UUID!]!) {
        currentUserInfo {
          id
        }
        contentsByIds(ids: $id) {
          id
          metadata {
            name
          }
          ... on QuizAssessment {
            quiz {
              assessmentId
              questionPool {
                ... on MultipleChoiceQuestion {
                  text
                  answers {
                    answerText
                    correct
                    feedback
                  }
                  numberOfCorrectAnswers
                }
                id
                number
                type
                hint
              }
              requiredCorrectAnswers
              questionPoolingMode
              numberOfRandomlySelectedQuestions
              selectedQuestions {
                ... on MultipleChoiceQuestion {
                  text
                  answers {
                    answerText
                    correct
                    feedback
                  }
                  numberOfCorrectAnswers
                }
                id
                number
                type
                hint
              }
            }
          }
        }
      }
    `,
    { id: [quizId] }
  );

  // Show 404 error page if id was not found
  if (contentsByIds.length == 0) {
    return <Error statusCode={404} title="Quiz could not be found." />;
  }
  const quiz = contentsByIds[0].quiz;
  if (quiz === null) {
    return <Error statusCode={404} />;
  }
  const currentQuestion = quiz!.selectedQuestions[currentIndex];
  const questionText = currentQuestion.text;
  const answers = currentQuestion.answers;

  const nextQuestion = async () => {
    if (!checkAnswers) {
      setCheckAnswers(true);
    } else if (
      checkAnswers &&
      currentIndex + 1 < (quiz?.selectedQuestions.length ?? 0)
    ) {
      setCheckAnswers(false);
      setCompletedInput([
        ...completedInput,
        {
          questionId: currentQuestion.id,
          usedHint,
          correct: !!currentQuestion.answers?.every(
            (x, idx) => x.correct || !userAnswers.includes(idx)
          ),
        },
      ]);
      setCurrentIndex(currentIndex + 1);
    } else {
      trackCompleted({
        variables: {
          input: {
            quizId: contentsByIds[0].id,
            completedQuestions: completedInput,
          },
        },
      });
      router.push(`/courses/${courseId}`);
    }
  };

  const handleAnswerChange = (index: any) => {
    setUserAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      if (newAnswers.includes(index)) {
        newAnswers.splice(newAnswers.indexOf(index), 1);
        return newAnswers;
      } else {
        newAnswers.push(index);
        return newAnswers;
      }
    });
  };

  return (
    <main>
      {error?.source.errors.map((err: any, i: number) => (
        <Alert
          key={i}
          severity="error"
          sx={{ minWidth: 400, maxWidth: 800, width: "fit-content" }}
          onClose={() => setError(null)}
        >
          {err.message}
        </Alert>
      ))}
      <Heading title={contentsByIds[0].metadata.name} backButton />
      <InfoDialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        title={questionText ?? ""}
        hint={currentQuestion.hint ?? ""}
      />

      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center">
        <div className="bg-white -mb-[9px] px-3 text-xs text-gray-600">
          {currentIndex + 1}/{quiz?.selectedQuestions.length ?? 0}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">
        {<RenderRichText value={questionText} />}
      </div>

      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center mb-6">
        <div>
          <Button
            onClick={() => {
              setInfoDialogOpen(true);
              setUsedHint(true);
            }}
            sx={{ color: "grey" }}
          >
            Hint
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <FormGroup>
          {answers!.map((answer, index) => (
            <div key={index}>
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={checkAnswers}
                    style={{
                      color:
                        checkAnswers && answer.correct
                          ? "green"
                          : checkAnswers
                          ? "red"
                          : userAnswers.includes(index)
                          ? "blue"
                          : "grey",
                    }}
                    onChange={() => handleAnswerChange(index)}
                    checked={userAnswers.includes(index)}
                  />
                }
                label={<RenderRichText value={answer.answerText} />}
              />
            </div>
          ))}
        </FormGroup>
      </div>
      <div className="mt-6 w-full flex justify-center">
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={nextQuestion}
          className="mb-6"
        >
          {!checkAnswers
            ? "Check"
            : currentIndex + 1 < (quiz?.selectedQuestions.length ?? 0)
            ? "Next"
            : "Finish"}
        </Button>
      </div>
    </main>
  );
}

function InfoDialog({
  title,
  hint,
  open,
  onClose,
}: {
  title: string;
  hint: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <Typography variant="body1" sx={{ padding: 3, paddingTop: 0 }}>
        {hint ? (
          <RenderRichText value={hint} />
        ) : (
          "There are no hints for this question."
        )}
      </Typography>
    </Dialog>
  );
}
