import { useState } from "react";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";

import { DialogBase } from "./DialogBase";
import { dialogSections, validationSchema } from "./dialogs/sectionDialog";
import { Section, SectionContent, SectionHeader } from "./Section";
import { Stage } from "./Stage";

export function AddSectionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Section>
        <SectionHeader
          action={
            <Button
              className="!ml-0.5"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
            >
              Add section
            </Button>
          }
        />
        <SectionContent>
          <Stage progress={0}>
            <div className="h-16"></div>
          </Stage>
        </SectionContent>
      </Section>
      <DialogBase
        open={open}
        title="Add section"
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
