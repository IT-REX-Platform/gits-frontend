import { Add } from "@mui/icons-material";
import { Alert, Button } from "@mui/material";
import { useState } from "react";

import { AddSectionButtonMutation } from "@/__generated__/AddSectionButtonMutation.graphql";
import { graphql, useMutation } from "react-relay";
import { DialogBase } from "./DialogBase";
import { Section, SectionContent, SectionHeader } from "./Section";
import { Stage } from "./Stage";
import { dialogSections, validationSchema } from "./dialogs/sectionDialog";

export function AddSectionButton({ chapterId }: { chapterId: string }) {
  const [open, setOpen] = useState(false);
  const [addSection, adding] = useMutation<AddSectionButtonMutation>(graphql`
    mutation AddSectionButtonMutation($input: CreateSectionInput!) {
      createSection(input: $input) {
        id
        ...StudentSectionFragment
        ...lecturerSectionFragment
      }
    }
  `);
  const [error, setError] = useState<any>(null);

  return (
    <>
      <Section>
        {error?.source.errors.map((err: any, i: number) => (
          <Alert
            key={i}
            severity="error"
            sx={{ minWidth: 400, maxWidth: 800, width: "fit-content" }}
            onClose={() => setError(null)}
          >
            {err.message}
          </Alert>
        ))}
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
        onSubmit={(data) =>
          addSection({
            variables: { input: { chapterId, name: data.name } },
            onCompleted() {
              setOpen(false);
            },
            updater(store, data) {
              const chapter = store.get(chapterId);
              const sections = chapter?.getLinkedRecords("sections");
              if (!chapter || !sections) return;

              chapter.setLinkedRecords(
                [...sections, store.get(data.createSection.id)!],
                "sections"
              );
            },
            onError: setError,
          })
        }
        initialValues={{
          name: "",
        }}
        validationSchema={validationSchema}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
