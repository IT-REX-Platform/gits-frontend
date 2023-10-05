import { StudentFlashcard$key } from "@/__generated__/StudentFlashcard.graphql";
import { sample } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { StudentFlashcardSide } from "./StudentFlashcardSide";

export function StudentFlashcard({
  _flashcard,
  label,
  onChange,
}: {
  _flashcard: StudentFlashcard$key;
  label: string;
  onChange: (correctness: number) => void;
}) {
  const flashcard = useFragment(
    graphql`
      fragment StudentFlashcard on Flashcard {
        id
        sides {
          ...StudentFlashcardSide
          isQuestion
          isAnswer
          label
          text
        }
      }
    `,
    _flashcard
  );

  const question = useMemo(
    () => sample(flashcard.sides.filter((x) => x.isQuestion)),
    [flashcard]
  );
  const answers = useMemo(
    () => flashcard.sides.filter((x) => x.isAnswer && x !== question),
    [flashcard, question]
  );
  const [knew, setKnew] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Reset when flashcard changes
    setKnew({});
  }, [flashcard]);

  useEffect(() => {
    // Notify parent about known status
    const numCorrect = answers
      .map((x) => knew[x.label] ?? false)
      .filter((x) => x).length;
    onChange(numCorrect / answers.length);
  }, [answers, question, knew, onChange]);

  return (
    <div>
      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center">
        <div className="bg-white -mb-[9px] px-3 text-xs text-gray-600">
          {label}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">
        {question?.text ?? "This flashcard does not have any questions."}
      </div>
      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center mb-6"></div>
      <div className="flex justify-center gap-4">
        {answers.map((answer) => (
          <StudentFlashcardSide
            key={answer.label}
            _side={answer}
            onChange={(knew) =>
              setKnew((oldValue) => ({ ...oldValue, [answer.label]: knew }))
            }
          />
        ))}
      </div>
    </div>
  );
}
