import { Alert } from "@mui/material";

export function FormErrors({
  error,
  onClose,
}: {
  error: any;
  onClose: () => void;
}) {
  return error?.source.errors.map((err: any, i: number) => (
    <Alert key={i} severity="error" onClose={onClose}>
      {err.message}
    </Alert>
  ));
}
