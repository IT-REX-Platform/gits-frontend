"use client";

import { studentQuizQuery } from "@/__generated__/studentQuizQuery.graphql";
import { Heading } from "@/components/Heading";
import {
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
import { graphql, useLazyLoadQuery } from "react-relay";

type UserAnswers = (number | null)[];

export default function StudentQuiz() {
  // Get course id from url
  const { quizId, courseId } = useParams();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [checkAnswers, setCheckAnswers] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>([]);

  useEffect(() => {
    // Reset user answers when the currentIndex changes
    setUserAnswers([]);
  }, [currentIndex]);

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
                  text {
                    text
                  }
                  answers {
                    answerText {
                      text
                    }
                    correct
                    feedback {
                      text
                    }
                  }
                  numberOfCorrectAnswers
                }
                id
                number
                type
                hint {
                  text
                }
              }
              requiredCorrectAnswers
              questionPoolingMode
              numberOfRandomlySelectedQuestions
              selectedQuestions {
                ... on MultipleChoiceQuestion {
                  text {
                    text
                  }
                  answers {
                    answerText {
                      text
                    }
                    correct
                    feedback {
                      text
                    }
                  }
                  numberOfCorrectAnswers
                }
                id
                number
                type
                hint {
                  text
                }
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
      setCurrentIndex(currentIndex + 1);
    } else {
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
      <Heading title={contentsByIds[0].metadata.name} backButton />
      <InfoDialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        title={questionText!.text}
        hint={currentQuestion.hint!.text}
      />
      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center">
        <div className="bg-white -mb-[9px] px-3 text-xs text-gray-600">
          {currentIndex + 1}/{quiz?.selectedQuestions.length ?? 0}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">{questionText!.text}</div>

      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center mb-6">
        <div>
          <Button
            onClick={() => setInfoDialogOpen(true)}
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
                label={answer.answerText.text}
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
  if (hint === null) {
    hint = "There are no hints for this question.";
  }
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <Typography variant="body1" sx={{ padding: 3, paddingTop: 0 }}>
        {hint}
      </Typography>
    </Dialog>
  );
}
