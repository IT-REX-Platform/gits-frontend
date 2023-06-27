import { ReactElement } from "react";
import { CircularProgress, Typography } from "@mui/material";
import { ArrowRight, Download } from "@mui/icons-material";

export function VideoContent({
  progress,
  subtitle,
  disabled = false,
}: {
  progress: number;
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <Content
      title="Watch video"
      subtitle={subtitle}
      disabled={disabled}
      icon={
        <ArrowRight
          sx={{
            fontSize: "2.5rem",
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? "bg-gray-100" : "bg-sky-200"}
          progress={disabled ? 0 : progress}
        />
      }
    />
  );
}

export function MaterialContent({
  subtitle,
  disabled = false,
}: {
  subtitle: string;
  disabled?: boolean;
}) {
  return (
    <Content
      title="Download content"
      subtitle={subtitle}
      disabled={disabled}
      icon={
        <Download
          sx={{ color: disabled ? "text.disabled" : "text.secondary" }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-amber-600"} />
      }
    />
  );
}

export function Content({
  title,
  subtitle,
  icon,
  iconFrame,
  disabled = false,
}: {
  title: string;
  subtitle: string;
  icon: ReactElement;
  iconFrame: ReactElement;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 pr-8 ${
        !disabled ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="w-16 h-16 relative flex justify-center items-center">
        {iconFrame}
        <div className="absolute">{icon}</div>
      </div>
      <div>
        <Typography
          variant="subtitle1"
          fontSize="1.25rem"
          fontWeight="500"
          lineHeight="1.5rem"
          color={disabled ? "text.disabled" : ""}
        >
          {title}
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight={400}
          color={disabled ? "text.disabled" : ""}
        >
          {subtitle}
        </Typography>
      </div>
    </div>
  );
}

export function ProgressFrame({
  color,
  progress,
}: {
  color: string;
  progress: number;
}) {
  return (
    <>
      <div className={`absolute w-16 h-16 rounded-full bg-white`}></div>
      <CircularProgress
        variant="determinate"
        value={100}
        size="4rem"
        thickness={3}
        sx={{ color: "grey.200" }}
      />
      <CircularProgress
        className="absolute"
        variant="determinate"
        color="success"
        value={progress}
        thickness={3}
        size="4rem"
      />
      <div className={`absolute w-12 h-12 rounded-full ${color}`}></div>
    </>
  );
}

function StaticFrame({ color }: { color?: string }) {
  return <div className={`w-12 h-12 rounded ${color ?? ""}`}></div>;
}
