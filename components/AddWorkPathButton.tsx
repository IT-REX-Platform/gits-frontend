import { useState } from "react";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";

import { DialogBase } from "./DialogBase";
import { dialogSections, validationSchema } from "./dialogs/workPathDialog";
import { WorkPath, WorkPathContent, WorkPathHeader } from "./WorkPath";
import { Stage } from "./Stage";

export function AddWorkPathButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <WorkPath>
        <WorkPathHeader
          action={
            <Button
              className="!ml-0.5"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
            >
              Add work path
            </Button>
          }
        />
        <WorkPathContent>
          <Stage progress={0}>
            <div className="h-16"></div>
          </Stage>
        </WorkPathContent>
      </WorkPath>
      <DialogBase
        open={open}
        title="Add new work path"
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
