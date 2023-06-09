"use client";
import { CircularProgress, Typography, useTheme } from "@mui/material";
import { ReactNode } from "react";

type SkillLevel = "green" | "yellow" | "red";
type SkillLevels = {
  remember: SkillLevel;
  understand: SkillLevel;
  apply: SkillLevel;
  analyze: SkillLevel;
};

export function ChapterHeader({
  progress,
  title,
  subtitle,
  skill_levels,
}: {
  progress: number;
  title: ReactNode;
  subtitle: string;
  skill_levels: SkillLevels;
}) {
  return (
    <div className="flex items-center">
      <div className="mr-10">
        <ChapterProgress progress={progress} />
      </div>
      <div className="px-12 py-4 flex bg-slate-200 rounded-full justify-between items-center flex-grow">
        <div className="pt-2 pr-8">
          <Typography variant="h2">{title}</Typography>
          <Typography variant="subtitle1">{subtitle}</Typography>
        </div>
        <div className="grid grid-rows-4 lg:grid-rows-2 xl:grid-rows-1 grid-flow-col auto-cols-auto gap-x-6 gap-y-1 lg:gap-y-2">
          <SkillLevel label="Remember" color={skill_levels.remember} />
          <SkillLevel label="Understand" color={skill_levels.understand} />
          <SkillLevel label="Apply" color={skill_levels.apply} />
          <SkillLevel label="Analyze" color={skill_levels.analyze} />
        </div>
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

export function SkillLevel({
  label,
  color,
}: {
  label: string;
  color: "red" | "yellow" | "green";
}) {
  const circleColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-300",
    red: "bg-red-500",
  };

  return (
    <div className="flex gap-2 items-center">
      <div className={`w-5 h-5 rounded-full ${circleColors[color]}`}></div>
      {label}
    </div>
  );
}
