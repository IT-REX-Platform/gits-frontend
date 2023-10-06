"use client";

import { EarlyRepeatWarnModalFragment$key } from "@/__generated__/EarlyRepeatWarnModalFragment.graphql";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
} from "@mui/material";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { graphql, useFragment } from "react-relay";

export function EarlyRepeatWarnModal({
  _progress,
  href,
  onClose,
  ...props
}: {
  _progress: EarlyRepeatWarnModalFragment$key;
  href: string;
  onClose: () => void;
} & DialogProps) {
  const { lastLearnDate, nextLearnDate } = useFragment(
    graphql`
      fragment EarlyRepeatWarnModalFragment on UserProgressData {
        nextLearnDate
        lastLearnDate
        contentId
      }
    `,
    _progress
  );
  const { push } = useRouter();

  const diffLastLearn = Math.abs(
    Math.floor(dayjs(lastLearnDate).diff(new Date(), "days"))
  );

  return (
    <Dialog maxWidth="xs" {...props}>
      <DialogTitle>You&apos;re a little early</DialogTitle>
      <DialogContent>
        You&apos;ve just learned this{" "}
        {diffLastLearn === 0
          ? "today"
          : `${diffLastLearn} day${diffLastLearn > 1 ? "s" : ""}`}{" "}
        ago. You won&apos;t earn any new reward points before{" "}
        {new Date(nextLearnDate ?? "").toLocaleDateString("en-EN")}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => push(href)} color="error">
          Learn anyway
        </Button>
        <Button onClick={onClose} color="primary">
          Go back
        </Button>
      </DialogActions>
    </Dialog>
  );
}
