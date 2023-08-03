import { useState } from "react";
import { IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";

import { DialogBase } from "./DialogBase";
import { dialogSections, validationSchema } from "./dialogs/workPathDialog";

export default function EditWorkPathButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Edit fontSize="small" />
      </IconButton>
      <DialogBase
        open={open}
        title="Edit work path"
        sections={dialogSections}
        initialValues={{
          name: "",
        }}
        validationSchema={validationSchema}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
