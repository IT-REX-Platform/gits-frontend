import { Button, CircularProgress } from "@mui/material";
import { StudentFlashcard } from "./StudentFlashcard";
import { graphql, useMutation } from "react-relay";
import { useState } from "react";
import { StudentFlashcardSetLogProgressMutation } from "@/__generated__/StudentFlashcardSetLogProgressMutation.graphql";
import { StudentFlashcard$key } from "@/__generated__/StudentFlashcard.graphql";
import { DisplayError } from "./PageError";

export type FlashcardData = {
  id: string;
  _flashcard: StudentFlashcard$key;
};

export function StudentFlashcardSet({
  flashcards,
  emptyMessage,
  onError = () => {},
  onComplete = () => {},
}: {
  flashcards: FlashcardData[];
  emptyMessage: string;
  onError?: (error: any) => void;
  onComplete?: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knew, setKnew] = useState(false);

  const [setFlashcardLearned, logging] =
    useMutation<StudentFlashcardSetLogProgressMutation>(graphql`
      mutation StudentFlashcardSetLogProgressMutation(
        $input: LogFlashcardLearnedInput!
      ) {
        logFlashcardLearned(input: $input) {
          success
        }
      }
    `);

  if (flashcards.length === 0) {
    return <DisplayError message={emptyMessage} />;
  }

  const currentFlashcard = flashcards[currentIndex];
  const nextCard = async () => {
    setFlashcardLearned({
      variables: {
        input: {
          flashcardId: currentFlashcard.id,
          successful: knew,
        },
      },
      onCompleted() {
        if (currentIndex + 1 < flashcards.length) {
          setCurrentIndex(currentIndex + 1);
          setKnew(false);
        } else {
          onComplete();
        }
      },
      onError,
    });
  };

  return (
    <div>
      <StudentFlashcard
        _flashcard={currentFlashcard._flashcard}
        label={`${currentIndex + 1}/${flashcards.length}`}
        onChange={(correctness) => setKnew(correctness === 1)}
      />

      <div className="mt-6 w-full flex justify-center">
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={nextCard}
          className="mb-6"
        >
          {logging ? (
            <CircularProgress size={16}></CircularProgress>
          ) : currentIndex + 1 < flashcards.length ? (
            "Next"
          ) : (
            "Finish"
          )}
        </Button>
      </div>
    </div>
  );
}
