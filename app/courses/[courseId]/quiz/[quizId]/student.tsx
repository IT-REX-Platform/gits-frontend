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
    createQuestionItem("Who is CEO of Tesla?", [
      { text: "Jeff Bezos", isCorrect: false },
      { text: "Elon Musk", isCorrect: true },
      { text: "Bill Gates", isCorrect: false },
      { text: "Tony Stark", isCorrect: false },
    ]),
    createQuestionItem("The iPhone was created by which company?", [
      { text: "Apple", isCorrect: true },
      { text: "Intel", isCorrect: false },
      { text: "Amazon", isCorrect: false },
      { text: "Microsoft", isCorrect: false },
    ]),
    createQuestionItem("How many Harry Potter books are there?", [
      { text: "1", isCorrect: false },
      { text: "4", isCorrect: false },
      { text: "6", isCorrect: false },
      { text: "7", isCorrect: true },
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
