"use client";
import { CircularProgress, Typography, useTheme } from "@mui/material";
import { ReactNode } from "react";
import { SkillLevels } from "./SkillLevels";

export function ChapterHeader({
  progress,
  title,
  subtitle,
}: {
  progress: number;
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <div className="flex items-center">
      <div className="mr-10">
        <ChapterProgress progress={progress} />
      </div>
      <div className="px-12 py-4 flex bg-gradient-to-r from-slate-200 to-slate-100 rounded-full justify-between items-center flex-grow">
        <div className="pt-2 pr-8">
          <Typography variant="h2">{title}</Typography>
          <Typography variant="subtitle1">{subtitle}</Typography>
        </div>
        <SkillLevels />
      </div>
    </div>
  );
}

export function ChapterProgress({ progress }: { progress: number }) {
  const theme = useTheme();
  return (
    <div className="relative flex justify-center items-center">
      <CircularProgress
        variant="determinate"
        value={100}
        size="3rem"
        thickness={4}
        sx={{ color: "grey.200" }}
      />
      <CircularProgress
        className="absolute"
        variant="determinate"
        color="success"
        value={progress}
        thickness={4}
        size="3rem"
      />
      <div
        className="w-8 h-8 absolute rounded-full"
        style={{ backgroundColor: theme.palette.grey["200"] }}
      ></div>
    </div>
  );
}
