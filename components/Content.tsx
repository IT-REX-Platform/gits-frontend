import { ComponentProps, MouseEventHandler, ReactElement } from "react";
import colors from "tailwindcss/colors";
import { CircularProgress, Typography, useTheme } from "@mui/material";
import {
  ArrowRight,
  Download,
  QuestionAnswerRounded,
} from "@mui/icons-material";

export function VideoContent({
  progress,
  subtitle,
  disabled = false,
  onClick = undefined,
}: {
  progress: number;
  subtitle: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <Content
      title="Watch video"
      subtitle={subtitle}
      disabled={disabled}
      className="hover:bg-sky-100 rounded-full"
      onClick={onClick}
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
          color={disabled ? colors.gray[100] : colors.sky[200]}
          progress={disabled ? 0 : progress}
        />
      }
    />
  );
}

export function FlashcardContent({
  progress,
  subtitle,
  disabled = false,
  onClick = undefined,
}: {
  progress: number;
  subtitle: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <Content
      title="Repeat flashcards"
      subtitle={subtitle}
      disabled={disabled}
      className="hover:bg-emerald-100 rounded-full"
      onClick={onClick}
      icon={
        <QuestionAnswerRounded
          sx={{
            fontSize: "2rem",
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.emerald[200]}
          progress={disabled ? 0 : progress}
        />
      }
    />
  );
}

export function MaterialContent({
  subtitle,
  disabled = false,
  onClick = undefined,
}: {
  subtitle: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <Content
      title="Download content"
      subtitle={subtitle}
      disabled={disabled}
      className="hover:bg-amber-100 rounded-xl"
      onClick={onClick}
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
  className = "",
  onClick = undefined,
}: {
  title: string;
  subtitle: string;
  icon: ReactElement;
  iconFrame: ReactElement;
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <button
      disabled={disabled}
      className={`group flex items-center text-left gap-4 pr-12 hover:disabled:bg-gray-50 ${
        !disabled ? "cursor-pointer" : "cursor-default"
      } ${className}`}
      onClick={onClick}
    >
      <div className="w-16 h-16 relative flex justify-center items-center group-hover:group-enabled:scale-105">
        {iconFrame}
        <div className="absolute">{icon}</div>
      </div>
      <div className="group-hover:group-enabled:translate-x-0.5">
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
    </button>
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
      <div
        className={`absolute w-16 h-16 rounded-full bg-white box-content group-hover:border-4 group-hover:border-white`}
      ></div>
      <CircularProgress
        variant="determinate"
        value={100}
        size="4rem"
        thickness={3}
        sx={{ color: "grey.100" }}
      />
      <CircularProgress
        className="absolute"
        variant="determinate"
        value={progress}
        thickness={3}
        size="4rem"
        sx={{ color }}
      />
      <div
        className={`absolute w-12 h-12 rounded-full`}
        style={{ backgroundColor: color }}
      ></div>
    </>
  );
}

function StaticFrame({ color }: { color?: string }) {
  return <div className={`w-12 h-12 rounded ${color ?? ""}`}></div>;
}
