import { DeleteStageButtonMutation } from "@/__generated__/DeleteStageButtonMutation.graphql";
import { Delete } from "@mui/icons-material";
import { Alert, Button } from "@mui/material";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";

export function DeleteStageButton({
  sectionId,
  stageId,
}: {
  sectionId: string;
  stageId: string;
}) {
  const [deleteStage] = useMutation<DeleteStageButtonMutation>(graphql`
    mutation DeleteStageButtonMutation($id: UUID!) {
      deleteStage(id: $id)
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
          deleteStage({
            variables: { id: stageId },
            onError: setError,
            updater(store, data) {
              const section = store.get(sectionId);
              const stages = section?.getLinkedRecords("stages");
              if (!section || !stages) return;
              section.setLinkedRecords(
                stages.filter((x) => x.getDataID() !== stageId),
                "stages"
              );
            },
          })
        }
        color="warning"
        startIcon={<Delete />}
      >
        Delete stage
      </Button>
    </>
  );
}
