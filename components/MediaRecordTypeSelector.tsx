import { MediaType } from "@/__generated__/MediaRecordSelectorCreateMediaRecordMutation.graphql";
import { Description, PersonalVideo } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";

export function MediaRecordTypeSelector({
  open,
  file,
  onSelect,
  onClose,
}: {
  open: boolean;
  file: File;
  onSelect: (type: MediaType) => void;
  onClose: () => void;
}) {
  let options: { value: MediaType; label: string; icon: ReactNode }[] = [];
  if (file.type.includes("pdf")) {
    options.push({
      value: "PRESENTATION",
      label: "Presentation",
      icon: <PersonalVideo />,
    });
  }

  options.push({ value: "DOCUMENT", label: "Document", icon: <Description /> });

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography variant="overline">{file.name}</Typography>
        <Typography variant="h6">Select content type</Typography>
      </DialogTitle>
      <List sx={{ paddingBottom: 2 }}>
        {options.map((option) => (
          <ListItemButton
            key={option.value}
            sx={{ paddingX: 3 }}
            onClick={() => onSelect(option.value)}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  );
}
