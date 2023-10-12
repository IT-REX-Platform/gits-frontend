import { LecturerEditFlashcardFragment$key } from "@/__generated__/LecturerEditFlashcardFragment.graphql";
import { LecturerEditFlashcardMutation } from "@/__generated__/LecturerEditFlashcardMutation.graphql";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { EditSideModal } from "./EditSideModal";
import {
  Backdrop,
  Button,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { FlashcardSide } from "./FlashcardSide";
import { Add } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";

export function Flashcard({
  title,
  onError,
  _flashcard,
  _assessmentId,
}: {
  title: string;
  onError: (error: any) => void;
  _flashcard: LecturerEditFlashcardFragment$key;
  _assessmentId: string;
}) {
  const flashcard = useFragment(
    graphql`
      fragment LecturerEditFlashcardFragment on Flashcard {
        id
        sides {
          label
          text
          isQuestion
          isAnswer
        }
      }
    `,
    _flashcard
  );

  const [addSideOpen, setAddSideOpen] = useState(false);
  const [updateFlashcard, isUpdating] =
    useMutation<LecturerEditFlashcardMutation>(graphql`
      mutation LecturerEditFlashcardMutation(
        $flashcard: UpdateFlashcardInput!
        $assessmentId: UUID!
      ) {
        mutateFlashcardSet(assessmentId: $assessmentId) {
          updateFlashcard(input: $flashcard) {
            ...LecturerEditFlashcardFragment
          }
        }
      }
    `);

  function handleEditFlashcardSide(idx: number, editedSide: FlashcardSideData) {
    const newFlashcard = {
      id: flashcard.id,
      sides: flashcard.sides.map((side, i) => {
        const { label, text, isQuestion, isAnswer } =
          i == idx ? editedSide : side;
        return { label, text, isQuestion, isAnswer };
      }),
    };

    updateFlashcard({
      variables: { assessmentId: _assessmentId, flashcard: newFlashcard },
      onError,
    });
  }

  function handleDeleteFlashcardSide(idx: number) {
    const newFlashcard = {
      id: flashcard.id,
      sides: flashcard.sides.filter((_, i) => i != idx),
    };

    updateFlashcard({
      variables: { assessmentId: _assessmentId, flashcard: newFlashcard },
      onError,
    });
  }

  function handleAddSideSubmit(newSide: FlashcardSideData) {
    const newFlashcard = {
      id: flashcard.id,
      sides: [
        ...flashcard.sides.map(({ label, text, isQuestion, isAnswer }) => ({
          label,
          text,
          isQuestion,
          isAnswer,
        })),
        newSide,
      ],
    };

    updateFlashcard({
      variables: { assessmentId: _assessmentId, flashcard: newFlashcard },
      onError,
      onCompleted() {
        setAddSideOpen(false);
      },
    });
  }

  return (
    <>
      <div>
        <Typography variant="overline" color="textSecondary">
          {title}
        </Typography>
        <div className="flex flex-wrap gap-2">
          {flashcard.sides.map((side, i) => (
            <div key={i} className="flex items-center">
              <FlashcardSide
                key={`${flashcard.id}-${i}`}
                side={side}
                onChange={(data) => handleEditFlashcardSide(i, data)}
              />
              <IconButton onClick={() => handleDeleteFlashcardSide(i)}>
                <ClearIcon />
              </IconButton>
            </div>
          ))}
        </div>
        <Button
          sx={{ marginTop: 1 }}
          startIcon={<Add />}
          onClick={() => setAddSideOpen(true)}
        >
          Add side
        </Button>
      </div>
      <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
      {addSideOpen && (
        <EditSideModal
          onClose={() => setAddSideOpen(false)}
          onSubmit={handleAddSideSubmit}
        />
      )}
    </>
  );
}

type FlashcardSideData = {
  label: string;
  text: string;
  isQuestion: boolean;
  isAnswer: boolean;
};
