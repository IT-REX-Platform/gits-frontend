import { Button } from "@mui/material";
import { Delete } from "@mui/icons-material";

export function DeleteStageButton() {
  return (
    <Button color="warning" startIcon={<Delete />}>
      Delete stage
    </Button>
  );
}
