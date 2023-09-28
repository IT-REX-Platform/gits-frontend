import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useState } from "react";

import { EditSectionButtonMutation } from "@/__generated__/EditSectionButtonMutation.graphql";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { DialogBase } from "./DialogBase";
import { dialogSections, validationSchema } from "./dialogs/sectionDialog";
import { EditSectionButtonDeleteMutation } from "@/__generated__/EditSectionButtonDeleteMutation.graphql";

export default function EditSectionButton({
  chapterId,
  sectionId,
  name,
}: {
  chapterId: string;
  sectionId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [editSection] = useMutation<EditSectionButtonMutation>(graphql`
    mutation EditSectionButtonMutation($sectionId: UUID!, $name: String!) {
      mutateSection(sectionId: $sectionId) {
        updateSectionName(name: $name) {
          name
        }
      }
    }
  `);
  const [deleteSection] = useMutation<EditSectionButtonDeleteMutation>(graphql`
    mutation EditSectionButtonDeleteMutation($sectionId: UUID!) {
      mutateSection(sectionId: $sectionId) {
        deleteSection
      }
    }
  `);
  const [error, setError] = useState<any>(null);

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Edit fontSize="small" />
      </IconButton>
      <DialogBase
        open={open}
        title="Edit section"
        sections={dialogSections}
        onSubmit={(data) =>
          editSection({
            variables: { sectionId, name: data.name },
            onCompleted() {
              setOpen(false);
            },
            onError: setError,
          })
        }
        initialValues={{ name }}
        validationSchema={validationSchema}
        onClose={() => setOpen(false)}
        onDelete={() =>
          deleteSection({
            variables: { sectionId },
            onCompleted: () => setOpen(false),
            onError: setError,
            updater(store) {
              const root = store.get(chapterId);
              if (!root) return;

              const sections = root.getLinkedRecords("sections") ?? [];
              root.setLinkedRecords(
                sections.filter((x) => x.getDataID() !== sectionId),
                "sections"
              );
            },
          })
        }
      />
    </>
  );
}
