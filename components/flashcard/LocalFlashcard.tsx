import { Button, Tooltip, Typography } from "@mui/material";
import { EditSideModal } from "./EditSideModal";
import { useState } from "react";
import { FlashcardSide } from "./FlashcardSide";
import { Add } from "@mui/icons-material";

export function LocalFlashcard({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (sides: FlashcardSideData[]) => void;
}) {
  const [sides, setSides] = useState<FlashcardSideData[]>([]);
  const [addSideOpen, setAddSideOpen] = useState(false);

  const numQuestions = sides.filter((s) => s.isQuestion).length;
  const numAnswers = sides.filter((s) => s.isAnswer).length;
  const valid = numQuestions >= 1 && numAnswers >= 1;

  function handleEditFlashcardSide(idx: number, data: FlashcardSideData) {
    setSides((sides) => sides.map((side, i) => (i == idx ? data : side)));
  }

  function handleAddSideSubmit(data: FlashcardSideData) {
    setSides((sides) => [...sides, data]);
    setAddSideOpen(false);
  }

  const saveButton = (
    <span>
      <Button
        variant="contained"
        disabled={!valid}
        onClick={() => onSubmit(sides)}
      >
        Save
      </Button>
    </span>
  );

  return (
    <div className="pt-4 pb-6 -mx-8 px-8 bg-gray-50">
      <Typography variant="overline" color="textSecondary">
        New flashcard (not saved)
      </Typography>
      <div className="flex flex-wrap gap-2">
        {sides.map((side, i) => (
          <FlashcardSide
            key={`add-flashcard-${i}`}
            side={side}
            onChange={(data) => handleEditFlashcardSide(i, data)}
          />
        ))}
      </div>
      <Button
        startIcon={<Add />}
        sx={{ marginTop: 1 }}
        onClick={() => setAddSideOpen(true)}
      >
        Add side
      </Button>
      <div className="mt-4 flex gap-2">
        {numQuestions < 1 ? (
          <Tooltip title="At least one question side is required to save">
            {saveButton}
          </Tooltip>
        ) : numAnswers < 1 ? (
          <Tooltip title="At least one answer side is required to save">
            {saveButton}
          </Tooltip>
        ) : (
          saveButton
        )}
        <Button onClick={onClose}>Cancel</Button>
      </div>
      {addSideOpen && (
        <EditSideModal
          onClose={() => setAddSideOpen(false)}
          onSubmit={handleAddSideSubmit}
        />
      )}
    </div>
  );
}

type FlashcardSideData = {
  label: string;
  text: string;
  isQuestion: boolean;
  isAnswer: boolean;
};
