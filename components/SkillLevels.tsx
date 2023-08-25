import { Box, Tooltip } from "@mui/material";
import { ReactNode } from "react";
import colors from "tailwindcss/colors";

export function SkillLevels({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid grid-flow-col auto-cols-fr gap-4 items-center ${className}`}
    >
      <SkillLevel label="Remember" level={1} progress={10} />
      <SkillLevel label="Understand" level={3} progress={45} />
      <SkillLevel label="Apply" level={5} progress={70} />
      <SkillLevel label="Analyze" level={7} progress={89} />
    </div>
  );
}

export function SkillLevel({
  level,
  label,
  progress,
}: {
  level: number;
  label: string;
  progress: number;
}) {
  if (level <= 2) {
    return (
      <SkillLevelBase
        badge={
          <SkillBadge
            color={colors.slate[500]}
            level={level}
            progress={progress}
          />
        }
        label={label}
        level="Iron"
        tooltipClass="!bg-slate-500"
      />
    );
  } else if (level <= 4) {
    return (
      <SkillLevelBase
        badge={<SkillBadge color="#bf8970" level={level} progress={progress} />}
        label={label}
        level="Bronze"
        tooltipClass="!bg-[#bf8970]"
      />
    );
  } else if (level <= 6) {
    return (
      <SkillLevelBase
        badge={<SkillBadge color="#c0c0c0" level={level} progress={progress} />}
        label={label}
        level="Silver"
        tooltipClass="!bg-[#c0c0c0]"
      />
    );
  } else if (level <= 8) {
    return (
      <SkillLevelBase
        badge={<SkillBadge color="#d4af37" level={level} progress={progress} />}
        label={label}
        level="Gold"
        tooltipClass="!bg-[#d4af37]"
      />
    );
  } else {
    return (
      <SkillLevelBase
        badge={
          <SkillBadge
            color={colors.emerald[600]}
            level={level}
            progress={progress}
          />
        }
        label={label}
        level="Emerald"
        tooltipClass="!bg-emerald-600"
      />
    );
  }
}

export function SkillLevelBase({
  badge,
  label,
  level,
  tooltipClass,
}: {
  badge: ReactNode;
  label: string;
  level: string;
  tooltipClass: string;
}) {
  return (
    <Tooltip
      title={
        <div className="text-center px-1">
          <div className="font-bold">{label}</div>
          <div className="text-[80%]">({level})</div>
        </div>
      }
      placement="top"
      slotProps={{
        popper: {
          modifiers: [{ name: "offset", options: { offset: [0, -5] } }],
        },
      }}
      classes={{
        tooltip: tooltipClass,
      }}
    >
      <Box>{badge}</Box>
    </Tooltip>
  );
}

export function SkillBadge({
  level,
  progress,
  color,
}: {
  level: number;
  progress: number;
  color: string;
}) {
  return (
    <div className="relative h-[3.25rem] w-12 flex justify-center select-none">
      <LevelIcon className="h-full" color={color} progress={progress} />
      <div className="absolute inset-0 text-white drop-shadow flex flex-col items-center justify-center">
        <div className="mt-0.5 text-xs">level</div>
        <div className="-mt-2 font-bold text-lg">{level}</div>
      </div>
    </div>
  );
}

export function LevelIcon({
  className = "",
  color,
  progress,
}: {
  className?: string;
  color: string;
  progress: number;
}) {
  return (
    <svg
      className={className}
      width="288.466"
      height="318.02"
      viewBox="0 0 76.323 84.143"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M69.445 60.133c-1.81 3.135-11.893 8.283-15.028 10.093-3.136 1.81-12.635 7.968-16.255 7.968-3.62 0-13.12-6.158-16.255-7.968-3.136-1.81-13.218-6.958-15.028-10.093-1.81-3.136-1.227-14.441-1.227-18.062 0-3.62-.584-14.925 1.227-18.06 1.81-3.136 11.892-8.284 15.028-10.094 3.135-1.81 12.634-7.968 16.255-7.968 3.62 0 13.12 6.157 16.255 7.968 3.135 1.81 13.217 6.958 15.028 10.093 1.81 3.136 1.227 14.44 1.227 18.061 0 3.62.583 14.926-1.227 18.062z"
        fill={color}
      />
      <path
        d="M72.883 62.118c-2.01 3.48-13.2 9.193-16.68 11.203-3.48 2.009-14.023 8.843-18.041 8.843-4.019 0-14.562-6.834-18.042-8.843-3.48-2.01-14.67-7.723-16.68-11.203-2.009-3.48-1.362-16.028-1.362-20.047 0-4.018-.647-16.566 1.362-20.046 2.01-3.48 13.2-9.194 16.68-11.203 3.48-2.01 14.023-8.844 18.042-8.844 4.018 0 14.561 6.835 18.041 8.844 3.48 2.01 14.67 7.723 16.68 11.203 2.01 3.48 1.362 16.028 1.362 20.046 0 4.019.647 16.567-1.362 20.047z"
        fill="none"
        stroke={color}
        strokeWidth="3.9568648"
        strokeDasharray={`${progress},${100 - progress}`}
        strokeDashoffset="33.3333"
        pathLength="100"
      />
    </svg>
  );
}
