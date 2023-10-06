"use client";

import { ProgressFrameFragment$key } from "@/__generated__/ProgressFrameFragment.graphql";
import { CircularProgress } from "@mui/material";
import { graphql, useFragment } from "react-relay";

export function ProgressFrame({
  color,
  _progress,
}: {
  color: string;
  _progress: ProgressFrameFragment$key;
}) {
  const progress = useFragment(
    graphql`
      fragment ProgressFrameFragment on UserProgressData {
        isLearned
      }
    `,
    _progress
  );
  return (
    <>
      <div
        className={`absolute w-full h-full rounded-full bg-white box-content group-hover:border-4 group-hover:border-white`}
      ></div>
      <CircularProgress
        variant="determinate"
        value={100}
        size="100%"
        thickness={3}
        sx={{ color: "grey.100" }}
      />
      <CircularProgress
        className="absolute"
        variant="determinate"
        value={progress?.isLearned === true ? 100 : 0}
        thickness={3}
        size="100%"
        sx={{ color }}
      />
      <div
        className={`absolute w-3/4 h-3/4 rounded-full`}
        style={{ backgroundColor: color }}
      ></div>
    </>
  );
}
