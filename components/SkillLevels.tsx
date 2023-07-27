import { Box, Tooltip } from "@mui/material";
import { ReactNode } from "react";

export function SkillLevels({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid grid-flow-col auto-cols-fr gap-4 items-center ${className}`}
    >
      <SkillLevel label="Remember" level={8} />
      <SkillLevel label="Understand" level={25} />
      <SkillLevel label="Apply" level={50} />
      <SkillLevel label="Analyze" level={69} />
    </div>
  );
}

export function SkillLevel({ level, label }: { level: number; label: string }) {
  if (level < 20) {
    return (
      <SkillLevelBase
        badge={<SkillBadge fillClass="fill-slate-500" level={level} />}
        label={label}
        level="Iron"
        tooltipClass="!bg-slate-500"
      />
    );
  } else if (level < 40) {
    return (
      <SkillLevelBase
        badge={<SkillBadge fillClass="fill-[#bf8970]" level={level} />}
        label={label}
        level="Bronze"
        tooltipClass="!bg-[#bf8970]"
      />
    );
  } else if (level < 60) {
    return (
      <SkillLevelBase
        badge={<SkillBadge fillClass="fill-[#c0c0c0]" level={level} />}
        label={label}
        level="Silver"
        tooltipClass="!bg-[#c0c0c0]"
      />
    );
  } else if (level < 80) {
    return (
      <SkillLevelBase
        badge={<SkillBadge fillClass="fill-[#d4af37]" level={level} />}
        label={label}
        level="Gold"
        tooltipClass="!bg-[#d4af37]"
      />
    );
  } else {
    return (
      <SkillLevelBase
        badge={<SkillBadge fillClass="fill-emerald-600" level={level} />}
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
  fillClass,
}: {
  level: number;
  fillClass: string;
}) {
  return (
    <div className="relative h-12 w-12 flex justify-center select-none">
      <LevelIcon className={`h-full ${fillClass}`} />
      <div className="absolute inset-0 text-white drop-shadow flex flex-col items-center justify-center">
        <div className="mt-0.5 text-xs">level</div>
        <div className="-mt-2 font-bold text-lg">{level}</div>
      </div>
    </div>
  );
}

export function LevelIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 65.199 72.245"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M110.521 113.205c-1.81 3.136-11.892 8.283-15.027 10.094-3.136 1.81-12.635 7.967-16.255 7.967-3.621 0-13.12-6.157-16.256-7.967-3.135-1.81-13.217-6.958-15.027-10.094-1.81-3.135-1.228-14.44-1.228-18.06 0-3.621-.583-14.927 1.228-18.062 1.81-3.136 11.892-8.283 15.027-10.093 3.136-1.81 12.635-7.968 16.256-7.968 3.62 0 13.12 6.157 16.255 7.968 3.135 1.81 13.217 6.957 15.027 10.093 1.81 3.135 1.228 14.44 1.228 18.061 0 3.62.583 14.926-1.228 18.061z"
        transform="translate(-46.639 -59.022)"
      />
    </svg>
  );
}
