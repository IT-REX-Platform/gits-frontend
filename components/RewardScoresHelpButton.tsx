import { Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import { FitnessIcon, GrowthIcon, HealthIcon, PowerIcon } from "./RewardScores";
import { ReactNode, useState } from "react";
import { HelpOutline } from "@mui/icons-material";

export function RewardScoresHelpButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button endIcon={<HelpOutline />} onClick={() => setOpen(true)}>
        Explain
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Reward Scores</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mb-2">
            <Description icon={<HealthIcon />}>
              <Label className="text-red-500">Health</Label> shows how
              up-to-date you are with published content. It is decreased when
              you are behind and increased whenever you learn new content that
              is due.
            </Description>

            <Description icon={<FitnessIcon />}>
              <Label className="text-blue-500">Fitness</Label> represents how
              well you repeat old content. It is calculated similarly to the
              health score but only considers content that is due for
              repetition. It also takes into account the correctness score of
              each element.
            </Description>

            <Description icon={<GrowthIcon />}>
              <Label className="text-green-500">Growth</Label> serves as a
              progress bar of the entire course, so you know how much of it is
              still ahead.
            </Description>

            <Description icon={<PowerIcon />}>
              <Label className="text-amber-400">Power</Label> is a composite
              value of the other scores and can be used to rank yourself with
              others. Higher values are better.
            </Description>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Description({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-8 ml-4">
      <div>{icon}</div>
      <div>{children}</div>
    </div>
  );
}

function Label({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span className={`font-semibold text-lg mr-1 ${className}`}>
      {children}
    </span>
  );
}
