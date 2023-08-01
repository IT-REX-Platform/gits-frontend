import { Typography } from "@mui/material";
import { ReactNode } from "react";

export function Subheading({
  action,
  children,
  className = "",
}: {
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`-mx-8 px-8 py-4 my-8 bg-slate-50 flex justify-between items-center ${className}`}
    >
      <Typography variant="h2">{children}</Typography>
      {action}
    </div>
  );
}
