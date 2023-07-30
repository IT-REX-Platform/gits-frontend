"use client";

import { Heading } from "@/components/Heading";
import { Button, Checkbox, FormGroup, FormControlLabel } from "@mui/material";

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface QuestionItem {
  question: string;
  answers: Answer[];
}

function createQuestionItem(question: string, answers: Answer[]): QuestionItem {
  return { question, answers };
}

export default function StudentQuiz() {
  const questionItems: readonly QuestionItem[] = [
    createQuestionItem("What is the capital of France?", [
      { text: "New York", isCorrect: false },
      { text: "London", isCorrect: false },
      { text: "Paris", isCorrect: true },
      { text: "Dublin", isCorrect: false },
    ]),
  ];
  return (
    <main>
      <Heading title="Quiz" backButton />

      {questionItems.map((questionItem) => (
        <div key={questionItem.question}>
          <div className="mt-6 text-center text-gray-600">
            {questionItem.question}
          </div>
          <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center mb-6"></div>
          <div>
            <FormGroup>
              {questionItem.answers.map((answer) => (
                <div key={answer.text}>
                  <FormControlLabel
                    control={<Checkbox />}
                    label={answer.text}
                  />
                </div>
              ))}
            </FormGroup>
          </div>
        </div>
      ))}
      <Button size="small" variant="text" color="inherit" className="mb-6">
        Next
      </Button>
    </main>
  );
}
