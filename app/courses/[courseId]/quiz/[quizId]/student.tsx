"use client";

import { studentQuizQuery } from "@/__generated__/studentQuizQuery.graphql";
import { Heading } from "@/components/Heading";
import {
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  Typography,
} from "@mui/material";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Info } from "@mui/icons-material";

/* interface Answer {
  text: string;
  isCorrect: boolean;
}

interface QuestionItem {
  question: string;
  answers: Answer[];
}

function createQuestionItem(question: string, answers: Answer[]): QuestionItem {
  return { question, answers };
} */

export default function StudentQuiz() {
  // Get course id from url
  const { quizId, courseId } = useParams();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [checkAnswers, setCheckAnswers] = useState(false);

  // Fetch quiz data
  const { contentsByIds, currentUserInfo } = useLazyLoadQuery<studentQuizQuery>(
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
                    text
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
                    text
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

  const quiz = contentsByIds[0].quiz;
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

  return (
    <main>
      <Heading title="Quiz" backButton />
      <InfoDialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        title={questionText!}
        hint={currentQuestion.hint!}
      />
      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center">
        <div className="bg-white -mb-[9px] px-3 text-xs text-gray-600">
          {currentIndex + 1}/{quiz?.selectedQuestions.length ?? 0}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">{questionText}</div>

      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center mb-6">
        <div>
          <IconButton onClick={() => setInfoDialogOpen(true)}>
            <QuestionMarkIcon />
          </IconButton>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <FormGroup>
          {answers!.map((answer, index) => (
            <div key={answer.text}>
              <FormControlLabel
                control={
                  <Checkbox value={answer.correct} disabled={checkAnswers} />
                }
                label={answer.text}
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
