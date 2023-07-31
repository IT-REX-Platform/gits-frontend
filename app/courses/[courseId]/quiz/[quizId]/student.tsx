"use client";

import { studentQuizQuery } from "@/__generated__/studentQuizQuery.graphql";
import { Heading } from "@/components/Heading";
import {
  Button,
  Checkbox,
  FormGroup,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

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
    if (currentIndex + 1 < (quiz?.selectedQuestions.length ?? 0)) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.push(`/courses/${courseId}`);
    }
  };

  return (
    <main>
      <Heading title="Quiz" backButton />

      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center">
        <div className="bg-white -mb-[9px] px-3 text-xs text-gray-600">
          {currentIndex + 1}/{quiz?.selectedQuestions.length ?? 0}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">{questionText}</div>

      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center mb-6"></div>

      <div className="flex justify-center gap-4">
        <FormGroup>
          {answers!.map((answer) => (
            <div key={answer.text}>
              <FormControlLabel control={<Checkbox />} label={answer.text} />
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
          {currentIndex + 1 < (quiz?.selectedQuestions.length ?? 0)
            ? "Next"
            : "Finish"}
        </Button>
      </div>
    </main>
  );
}
