import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { RichTextEditor } from "../RichTextEditor";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";

export function EditRichTextButton({
  title,
  icon,
  initialValue,
  placeholder,
  _allRecords,
  onSave: _onSave,
}: {
  title: string;
  icon: ReactNode;
  initialValue: string;
  placeholder?: string;
  _allRecords: MediaRecordSelector$key;
  onSave: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (!open) {
      setValue(initialValue);
    }
  }, [open, initialValue]);

  const onSave = () => {
    _onSave(value);
    setOpen(false);
  };

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>{icon}</IconButton>
      <Dialog maxWidth="lg" open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <RichTextEditor
            className="w-[700px]"
            _allRecords={_allRecords}
            initialValue={value}
            placeholder={placeholder}
            onChange={setValue}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
