import { AssociationQuestionFragment$key } from "@/__generated__/AssociationQuestionFragment.graphql";
import { useCallback, useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";
import { QuestionDivider } from "./QuestionDivider";
import { Check, Clear } from "@mui/icons-material";
import { FeedbackTooltip } from "./FeedbackTooltip";

export function AssociationQuestion({
  _question,
  feedbackMode = false,
  onHint = () => {},
  onChange = () => {},
}: {
  _question: AssociationQuestionFragment$key;
  feedbackMode?: boolean;
  onHint?: () => void;
  onChange?: (correct: boolean) => void;
}) {
  const question = useFragment(
    graphql`
      fragment AssociationQuestionFragment on AssociationQuestion {
        id
        text
        leftSide
        rightSide
        correctAssociations {
          left
          right
          feedback
        }
        ...QuestionDividerFragment
      }
    `,
    _question
  );

  const [associated, setAssociated] = useState<[string, string][]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  const removeAssociation = (index: number) => {
    setAssociated((oldValue) => [
      ...oldValue.slice(0, index),
      ...oldValue.slice(index + 1),
    ]);
  };
  const isCorrect = useCallback(
    ([left, right]: [string, string]) =>
      question.correctAssociations.find((a) => a.left === left)?.right ===
      right,
    [question]
  );

  useEffect(() => {
    // Reset when question changes
    setAssociated([]);
  }, [question]);

  useEffect(() => {
    // Add association after left and right have been clicked
    if (selectedLeft !== null && selectedRight !== null) {
      setAssociated((oldValue) => [...oldValue, [selectedLeft, selectedRight]]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [selectedLeft, selectedRight]);

  useEffect(() => {
    // Notify parent about correctness of answer
    onChange(
      associated.length === question.correctAssociations.length &&
        associated.every(isCorrect)
    );
  }, [associated, question, onChange, isCorrect]);

  // Filter out options which have been used already
  const unusedLeft = useMemo(
    () =>
      question.leftSide.filter(
        (value) => !associated.find((a) => a[0] === value)
      ),
    [question, associated]
  );
  const unusedRight = useMemo(
    () =>
      question.rightSide.filter(
        (value) => !associated.find((a) => a[1] === value)
      ),
    [question, associated]
  );
  const remainingAssociations = useMemo(
    () =>
      unusedLeft.map(
        (left) => question.correctAssociations.find((a) => a.left === left)!
      ),
    [unusedLeft, question]
  );

  return (
    <div>
      <div className="mt-6 text-center text-gray-600">
        <RenderRichText value={question.text} />
      </div>
      <QuestionDivider _question={question} onHint={onHint} />
      {(associated.length > 0 || feedbackMode) && (
        <div className="flex flex-col items-center gap-2 mb-6">
          {associated.map(([left, right], i) => {
            const correctAssociation = question.correctAssociations.find(
              (a) => a.left === left
            );
            if (!correctAssociation) {
              return;
            }
            return (
              <FeedbackTooltip
                key={`${question.id}-${i}`}
                correctAnswer={
                  <RenderRichText value={correctAssociation.right} />
                }
                feedback={correctAssociation.feedback}
                disabled={!feedbackMode}
              >
                <Association
                  left={left}
                  right={right}
                  correct={isCorrect([left, right])}
                  remaining={false}
                  feedbackMode={feedbackMode}
                  onClick={() => !feedbackMode && removeAssociation(i)}
                />
              </FeedbackTooltip>
            );
          })}
          {feedbackMode &&
            remainingAssociations.map((a, i) => (
              <FeedbackTooltip
                key={`${question.id}-remaining-${i}`}
                correctAnswer={<RenderRichText value={a.right} />}
                feedback={a.feedback}
                disabled={false}
              >
                <Association
                  left={a.left}
                  right={a.right}
                  correct={false}
                  remaining={true}
                  feedbackMode={true}
                  onClick={() => {}}
                />
              </FeedbackTooltip>
            ))}
        </div>
      )}
      {unusedLeft.length > 0 && !feedbackMode && (
        <div className="flex">
          <div className="flex flex-col items-end gap-4 grow my-2">
            {unusedLeft.map((value, i) => (
              <OptionBox
                key={`${question.id}-${i}`}
                value={value}
                selected={selectedLeft === value}
                feedbackMode={feedbackMode}
                onClick={() =>
                  !feedbackMode &&
                  setSelectedLeft((oldValue) =>
                    oldValue !== value ? value : null
                  )
                }
              />
            ))}
          </div>
          <div className="mx-4 border-l"></div>
          <div className="flex flex-col items-start gap-4 grow my-2">
            {unusedRight.map((value, i) => (
              <OptionBox
                key={`${question.id}-${i}`}
                value={value}
                selected={selectedRight === value}
                feedbackMode={feedbackMode}
                onClick={() =>
                  !feedbackMode &&
                  setSelectedRight((oldValue) =>
                    oldValue !== value ? value : null
                  )
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Association({
  left,
  right,
  correct,
  remaining,
  feedbackMode,
  onClick,
}: {
  left: string;
  right: string;
  correct: boolean;
  remaining: boolean;
  feedbackMode: boolean;
  onClick: () => void;
}) {
  const borderColor =
    !feedbackMode || remaining
      ? "border-gray-400"
      : correct
      ? "border-green-400"
      : "border-red-400";
  const pointerClass = !feedbackMode ? "cursor-pointer" : "";
  return (
    <div
      className={`relative flex items-center ${pointerClass} ${borderColor}`}
      onClick={onClick}
    >
      <div className="border border-inherit rounded-sm px-2">
        <RenderRichText value={left} />
      </div>
      <div className="w-4 border-b border-inherit"></div>
      <div className="border border-inherit rounded-sm px-2">
        <RenderRichText value={right} />
      </div>
      {feedbackMode && (
        <div className="absolute left-full inset-y-0 ml-2 flex items-center">
          {correct ? (
            <Check fontSize="small" className="!text-green-400" />
          ) : (
            <Clear
              fontSize="small"
              className={remaining ? "!text-gray-400" : "!text-red-400"}
            />
          )}
        </div>
      )}
    </div>
  );
}

function OptionBox({
  value,
  selected,
  feedbackMode,
  onClick,
}: {
  value: string;
  selected: boolean;
  feedbackMode: boolean;
  onClick: () => void;
}) {
  const selectedClass = selected ? "border-blue-400 bg-blue-50" : "";
  const pointerClass = !feedbackMode ? "cursor-pointer" : "";
  return (
    <div
      className={`border rounded-sm px-2 ${pointerClass} ${selectedClass}`}
      onClick={onClick}
    >
      <RenderRichText value={value} />
    </div>
  );
}
