import { MultipleChoiceQuestionFragment$key } from "@/__generated__/MultipleChoiceQuestionFragment.graphql";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { shuffle } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";
import { QuestionDivider } from "./QuestionDivider";

export function MultipleChoiceQuestion({
  _question,
  feedbackMode = false,
  onHint = () => {},
  onChange = () => {},
}: {
  _question: MultipleChoiceQuestionFragment$key;
  feedbackMode?: boolean;
  onHint?: () => void;
  onChange?: (correct: boolean) => void;
}) {
  const question = useFragment(
    graphql`
      fragment MultipleChoiceQuestionFragment on MultipleChoiceQuestion {
        id

        text

        answers {
          correct
          answerText
          feedback
        }

        ...QuestionDividerFragment
      }
    `,
    _question
  );

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  function handleAnswerChange(index: number) {
    setSelectedAnswers((answers) =>
      answers.includes(index)
        ? answers.filter((idx) => idx !== index)
        : [...answers, index]
    );
  }

  useEffect(() => {
    // Notify parent about correctness of answer
    onChange(
      question.answers.every(
        (answer, i) => answer.correct || !selectedAnswers.includes(i)
      )
    );
  }, [selectedAnswers, onChange, question]);

  useEffect(() => {
    // Clear selection when question changes
    setSelectedAnswers([]);
  }, [question]);

  const shuffled = useMemo(() => shuffle(question.answers), [question.answers]);

  return (
    <div>
      {/* Question */}
      <div className="mt-6 text-center text-gray-600">
        {<RenderRichText value={question.text} />}
      </div>

      <QuestionDivider _question={question} onHint={onHint} />

      {/* Answer options */}
      <div className="flex justify-center gap-4">
        <FormGroup>
          {shuffled.map((answer, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  disabled={feedbackMode}
                  style={{
                    color: feedbackMode
                      ? answer.correct
                        ? "green"
                        : "red"
                      : selectedAnswers.includes(index)
                      ? "blue"
                      : "grey",
                  }}
                  onChange={() => handleAnswerChange(index)}
                  checked={selectedAnswers.includes(index)}
                />
              }
              label={<RenderRichText value={answer.answerText} />}
            />
          ))}
        </FormGroup>
      </div>
    </div>
  );
}
