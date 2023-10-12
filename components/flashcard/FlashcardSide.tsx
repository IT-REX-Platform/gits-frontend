import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from "@mui/material";
import { EditSideModal } from "./EditSideModal";
import { Edit, Help, QuestionAnswer } from "@mui/icons-material";
import { useState } from "react";

export function FlashcardSide({
  side,
  onChange,
}: {
  onChange: (side: FlashcardSideData) => void;
  side: FlashcardSideData;
}) {
  const [edit, setEdit] = useState(false);

  function handleEditSubmit(data: FlashcardSideData) {
    setEdit(false);
    onChange(data);
  }

  return (
    <>
      <Card variant="outlined" className="min-w-[20rem] max-w-[30%]">
        <CardHeader
          title={side.label}
          avatar={
            side.isQuestion ? (
              <Help fontSize="large" sx={{ color: "grey.400" }} />
            ) : (
              <QuestionAnswer fontSize="large" sx={{ color: "grey.400" }} />
            )
          }
          action={
            <IconButton onClick={() => setEdit(true)}>
              <Edit fontSize="small" />
            </IconButton>
          }
          classes={{
            action: "!my-0",
          }}
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {side.text}
          </Typography>
        </CardContent>
      </Card>
      {edit && (
        <EditSideModal
          onClose={() => setEdit(false)}
          onSubmit={handleEditSubmit}
          side={side}
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
