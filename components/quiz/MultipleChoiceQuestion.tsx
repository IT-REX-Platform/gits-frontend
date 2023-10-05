import { MultipleChoiceQuestionFragment$key } from "@/__generated__/MultipleChoiceQuestionFragment.graphql";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { shuffle } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";
import { QuestionDivider } from "./QuestionDivider";
import colors from "tailwindcss/colors";
import { CorrectnessIndicator } from "./CorrectnessIndicator";
import clsx from "clsx";

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
  const shuffled = useMemo(() => shuffle(question.answers), [question]);

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
      shuffled.every(
        (answer, i) => answer.correct === selectedAnswers.includes(i)
      )
    );
  }, [selectedAnswers, shuffled, onChange]);

  useEffect(() => {
    // Clear selection when question changes
    setSelectedAnswers([]);
  }, [question]);

  return (
    <div>
      {/* Question */}
      <div className="mt-6 text-center text-gray-600">
        {<RenderRichText value={question.text} />}
      </div>

      <QuestionDivider _question={question} onHint={onHint} />

      {/* Answer options */}
      <div className="flex justify-center">
        <div
          className={clsx({
            "grid items-center gap-y-2": true,
            "grid-cols-[auto_auto_auto]": feedbackMode,
            "grid-cols-[auto_auto]": !feedbackMode,
          })}
        >
          {shuffled.map((answer, index) => (
            <Option
              key={index}
              checked={selectedAnswers.includes(index)}
              correct={answer.correct}
              feedbackMode={feedbackMode}
              label={answer.answerText}
              onChange={() => handleAnswerChange(index)}
            />
          ))}
          {feedbackMode && (
            <>
              <div></div>
              <div className="text-sm text-gray-500">Solution</div>
              <div></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Option({
  checked,
  correct,
  feedbackMode,
  label,
  onChange,
}: {
  checked: boolean;
  correct: boolean;
  feedbackMode: boolean;
  label: string;
  onChange: () => void;
}) {
  const color = correct === checked ? colors.green[400] : colors.red[400];
  return (
    <>
      <Checkbox
        disabled={feedbackMode}
        onChange={onChange}
        checked={checked}
        sx={{
          padding: 0,
          "&.Mui-disabled": { color },
        }}
      />
      {feedbackMode && (
        <Checkbox disabled checked={correct} sx={{ padding: 0 }} />
      )}
      <div
        className={clsx({
          "ml-2": !feedbackMode,
          "ml-1 text-gray-500": feedbackMode,
        })}
      >
        <RenderRichText value={label} />
      </div>
    </>
  );
}
