"use client";
import { Done, ExpandLess, ExpandMore } from "@mui/icons-material";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import { ReactNode } from "react";
import { SkillLevels } from "./SkillLevels";
import { graphql, useFragment } from "react-relay";
import { ChapterHeaderFragment$key } from "@/__generated__/ChapterHeaderFragment.graphql";
import dayjs from "dayjs";

export function ChapterHeader({
  _chapter,
  expanded,
  action,
  onExpandClick,
}: {
  _chapter: ChapterHeaderFragment$key;
  expanded?: boolean;
  action?: ReactNode;
  onExpandClick?: () => void;
}) {
  const chapter = useFragment(
    graphql`
      fragment ChapterHeaderFragment on Chapter {
        title
        suggestedStartDate
        suggestedEndDate
        contents {
          userProgressData {
            lastLearnDate
          }
        }
        ...SkillLevelsFragment
      }
    `,
    _chapter
  );

  const chapterProgress =
    chapter.contents.length > 0
      ? (100 *
          chapter.contents.filter(
            (content) => content.userProgressData.lastLearnDate != null
          ).length) /
        chapter.contents.length
      : 0;

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
        <ChapterProgress progress={chapterProgress} />
      </div>
      <div className="flex justify-between items-center flex-grow">
        <div className="pr-8 flex flex-col items-start">
          <div className="flex gap-2 items-center">
            <Typography variant="h2" onClick={(e) => e.stopPropagation()}>
              {chapter.title}
            </Typography>
            {action}
          </div>
          <Typography variant="subtitle1" onClick={(e) => e.stopPropagation()}>
            {dayjs(chapter.suggestedStartDate).format("D. MMMM")} –{" "}
            {dayjs(chapter.suggestedEndDate).format("D. MMMM")}
          </Typography>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <SkillLevels _chapter={chapter} />
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
