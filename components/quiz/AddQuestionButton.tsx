import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { Add, List as ListIcon, TextFields } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState } from "react";
import { AddClozeQuestionModal } from "./AddClozeQuestionModal";
import { MultipleChoiceQuestionModal } from "../MultipleChoiceQuestionModal";

export function AddQuestionButton({
  _allRecords,
  assessmentId,
}: {
  _allRecords: MediaRecordSelector$key;
  assessmentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [addMultipleChoice, setAddMultipleChoice] = useState(false);
  const [addCloze, setAddCloze] = useState(false);

  return (
    <>
      <Button startIcon={<Add />} onClick={() => setOpen(true)}>
        Add question
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Choose question type</DialogTitle>
        <List sx={{ paddingTop: 0 }}>
          <ListItemButton
            onClick={() => {
              setAddMultipleChoice(true);
              setOpen(false);
            }}
          >
            <ListItemIcon>
              <ListIcon />
            </ListItemIcon>
            <ListItemText primary="Add multiple choice question" />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              setAddCloze(true);
              setOpen(false);
            }}
          >
            <ListItemIcon>
              <TextFields />
            </ListItemIcon>
            <ListItemText primary="Add cloze question" />
          </ListItemButton>
        </List>
      </Dialog>
      <MultipleChoiceQuestionModal
        _allRecords={_allRecords}
        assessmentId={assessmentId}
        contentId={assessmentId}
        onClose={() => setAddMultipleChoice(false)}
        open={addMultipleChoice}
      />
      <AddClozeQuestionModal
        _allRecords={_allRecords}
        assessmentId={assessmentId}
        open={addCloze}
        onClose={() => setAddCloze(false)}
      />
    </>
  );
}
