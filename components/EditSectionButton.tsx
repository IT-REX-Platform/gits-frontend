import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useState } from "react";

import { EditSectionButtonMutation } from "@/__generated__/EditSectionButtonMutation.graphql";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { DialogBase } from "./DialogBase";
import { dialogSections, validationSchema } from "./dialogs/sectionDialog";

export default function EditSectionButton({
  sectionId,
  name,
}: {
  sectionId: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [editSection] = useMutation<EditSectionButtonMutation>(graphql`
    mutation EditSectionButtonMutation($input: UpdateSectionInput!) {
      updateSection(input: $input) {
        id
        ...studentCoursePageSectionFragment
        ...lecturerSectionFragment
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
            variables: { input: { id: sectionId, name: data.name } },
            onCompleted() {
              setOpen(false);
            },
            onError: setError,
          })
        }
        initialValues={{ name }}
        validationSchema={validationSchema}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
