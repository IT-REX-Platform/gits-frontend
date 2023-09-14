import { AddStageButtonMutation } from "@/__generated__/AddStageButtonMutation.graphql";
import { Add } from "@mui/icons-material";
import { Alert, Button } from "@mui/material";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";

export function AddStageButton({ sectionId }: { sectionId: string }) {
  const [addStage] = useMutation<AddStageButtonMutation>(graphql`
    mutation AddStageButtonMutation($id: UUID!) {
      mutateSection(sectionId: $id) {
        createStage(input: { requiredContents: [], optionalContents: [] }) {
          id
          ...studentCoursePageStageFragment
          ...lecturerStageFragment
        }
      }
    }
  `);

  const [error, setError] = useState<any>(null);

  return (
    <>
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

      <Button
        onClick={() =>
          addStage({
            variables: { id: sectionId },
            onError: setError,
            updater(store, data) {
              const section = store.get(sectionId);
              const stages = section?.getLinkedRecords("stages");
              if (!section || !stages) return;
              section.setLinkedRecords(
                [...stages, store.get(data.mutateSection.createStage.id)!],
                "stages"
              );
            },
          })
        }
        startIcon={<Add />}
      >
        Add stage
      </Button>
    </>
  );
}
