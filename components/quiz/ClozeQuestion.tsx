import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";
import { ReactElement, useEffect, useState } from "react";
import { QuestionDivider } from "./QuestionDivider";
import { ClozeQuestionFragment$key } from "@/__generated__/ClozeQuestionFragment.graphql";
import { reverse } from "lodash";
import { useDrag, useDrop } from "react-dnd";
import { RichTextEditorFragment$key } from "@/__generated__/RichTextEditorFragment.graphql";
import { Box, Tooltip } from "@mui/material";

export function ClozeQuestion({
  _question,
  feedbackMode = false,
  onHint = () => {},
  onChange = () => {},
}: {
  _question: ClozeQuestionFragment$key;
  feedbackMode?: boolean;
  onHint?: () => void;
  onChange?: (correct: boolean) => void;
}) {
  const question = useFragment(
    graphql`
      fragment ClozeQuestionFragment on ClozeQuestion {
        id

        clozeElements {
          __typename
          ... on ClozeTextElement {
            text {
              ...RichTextEditorFragment
            }
          }
          ... on ClozeBlankElement {
            correctAnswer
            feedback {
              ...RichTextEditorFragment
            }
          }
        }

        allBlanks

        ...QuestionDividerFragment
      }
    `,
    _question
  );

  const numberOfBlanks = question.clozeElements.filter(
    (el) => el.__typename === "ClozeBlankElement"
  ).length;

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [k in number]: string;
  }>({});
  const [correct, setCorrect] = useState<{ [k in number]: boolean }>({});
  function handleBlankChange(idx: number, value: string, correct: boolean) {
    setSelectedAnswers((prev) => ({ ...prev, [idx]: value }));
    setCorrect((prev) => ({ ...prev, [idx]: correct }));
  }

  useEffect(() => {
    // Notify parent about correctness of answer
    onChange(Object.values(correct).filter((v) => v).length === numberOfBlanks);
  }, [onChange, correct, numberOfBlanks]);

  useEffect(() => {
    // Clear selection when question changes
    setSelectedAnswers({});
  }, [question, setSelectedAnswers]);

  return (
    <div>
      {/* Cloze text */}
      <div className="mt-6 text-center text-gray-600">
        {question.clozeElements.map((element, i) =>
          element.__typename === "ClozeTextElement" ? (
            <span key={i}>
              <RenderRichText value={element.text} />
            </span>
          ) : element.__typename === "ClozeBlankElement" ? (
            <FeedbackTooltip
              key={i}
              feedback={element.feedback}
              disabled={!feedbackMode}
              correctAnswer={element.correctAnswer}
            >
              <ClozeElementBlank
                value={selectedAnswers[i] ?? ""}
                correctAnswer={element.correctAnswer}
                feedbackMode={feedbackMode}
                onChange={(value) =>
                  handleBlankChange(i, value, value === element.correctAnswer)
                }
              />
            </FeedbackTooltip>
          ) : undefined
        )}
      </div>

      <QuestionDivider _question={question} onHint={onHint} />

      {/* Answer options */}
      <div className="flex justify-center">
        <div className="max-w-sm flex justify-center gap-4 flex-wrap">
          {question.allBlanks.map((value, i) => (
            <ClozeElementValue
              key={i}
              value={value}
              used={Object.values(selectedAnswers).includes(value)}
              feedbackMode={feedbackMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClozeElementBlank({
  value,
  correctAnswer,
  feedbackMode,
  onChange,
}: {
  value: string;
  correctAnswer: string;
  feedbackMode: boolean;
  onChange: (value: string) => void;
}) {
  // Setup drop target
  const [, drop] = useDrop(
    () => ({
      accept: "cloze-value",
      drop: (item: { value: string }) => {
        const oldValue = value;
        onChange(item.value);
        return { value: oldValue };
      },
    }),
    [onChange, value]
  );

  // Make draggable
  const [, drag] = useDrag(
    () => ({
      type: "cloze-value",
      item: { value },
      end: (_, monitor) => {
        const result = monitor.getDropResult<{ value: string }>();
        onChange(result?.value ?? "");
      },
    }),
    [value, onChange]
  );

  const cursor = !feedbackMode ? "cursor-move" : "";
  const color = feedbackMode
    ? value === correctAnswer
      ? "text-green-600 border-green-600"
      : "text-red-600 border-red-600"
    : "border-gray-300";

  if (value !== "") {
    return (
      <span
        ref={!feedbackMode ? (node) => drag(drop(node)) : undefined}
        className={`border-b mx-1 select-none ${cursor} ${color}`}
      >
        {value}
      </span>
    );
  }

  return (
    <span
      ref={!feedbackMode ? drop : undefined}
      className={`inline-block h-5 w-12 mx-1 -mb-0.5 border-b ${color}`}
    ></span>
  );
}

function ClozeElementValue({
  value,
  used,
  feedbackMode,
}: {
  value: string;
  used: boolean;
  feedbackMode: boolean;
}) {
  const [, drag] = useDrag(() => ({
    type: "cloze-value",
    item: { value },
  }));

  const textColor = feedbackMode ? "text-gray-500" : "";
  const usedStyle = used ? "bg-gray-100 line-through" : "";
  const cursorStyle = !used && !feedbackMode ? "cursor-move" : "";

  return (
    <div
      ref={!used && !feedbackMode ? drag : undefined}
      className={`border border-gray-300 rounded-sm px-2 ${textColor} ${usedStyle} ${cursorStyle} select-none`}
    >
      {value}
    </div>
  );
}

function FeedbackTooltip({
  disabled,
  feedback,
  correctAnswer,
  children,
}: {
  feedback: RichTextEditorFragment$key | null;
  children: ReactElement;
  correctAnswer: string;
  disabled: boolean;
}) {
  if (disabled) {
    return children;
  }

  return (
    <Tooltip
      arrow
      placement="right"
      title={
        <div className="font-normal">
          <div className="text-sm">&rarr; {correctAnswer}</div>
          {feedback && <RenderRichText value={feedback} />}
        </div>
      }
      classes={{
        tooltip: "!bg-white border border-gray-200 !text-black",
      }}
    >
      <Box display="inline-block">{children}</Box>
    </Tooltip>
  );
}
