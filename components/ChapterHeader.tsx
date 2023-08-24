"use client";
import { Done, ExpandLess, ExpandMore } from "@mui/icons-material";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import { MouseEvent, ReactNode } from "react";
import { SkillLevels } from "./SkillLevels";

export function ChapterHeader({
  progress,
  title,
  subtitle,
  expanded,
  onExpandClick,
}: {
  expanded?: boolean;
  progress: number;
  title: ReactNode;
  subtitle: string;
  onExpandClick?: () => void;
}) {
  return (
    <div
      className="flex items-center py-4 pl-8 pr-12 -mx-8 mb-8 bg-gradient-to-r from-slate-100 to-slate-50"
      onClick={onExpandClick}
    >
      {expanded !== undefined && (
        <IconButton className="!-ml-2 !mr-4">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      )}
      <div className="mr-8">
        <ChapterProgress progress={progress} />
      </div>
      <div className="flex justify-between items-center flex-grow">
        <div className="pr-8">
          <Typography variant="h2" onClick={(e) => e.stopPropagation()}>
            {title}
          </Typography>
          <Typography variant="subtitle1" onClick={(e) => e.stopPropagation()}>
            {subtitle}
          </Typography>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <SkillLevels />
        </div>
      </div>
    </div>
  );
}

export function ChapterProgress({ progress }: { progress: number }) {
  return (
    <div className="relative flex justify-center items-center">
      <div className="absolute h-12 w-12 rounded-full shadow-lg shadow-slate-100"></div>
      <div className="absolute h-10 w-10 rounded-full shadow-inner shadow-slate-100"></div>
      <CircularProgress
        variant="determinate"
        value={100}
        size="3rem"
        thickness={4}
        className="!text-white"
      />
      <CircularProgress
        className="absolute"
        variant="determinate"
        color="success"
        value={progress}
        thickness={4}
        size="3rem"
      />
      {progress == 100 && (
        <Done fontSize="large" className="absolute text-green-600" />
      )}
    </div>
  );
}
