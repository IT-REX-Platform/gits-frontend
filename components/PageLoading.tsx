"use client";
import { CircularProgress } from "@mui/material";

export function PageLoading() {
  return (
    <div className="flex w-full h-full items-center justify-center">
      <CircularProgress />
    </div>
  );
}
