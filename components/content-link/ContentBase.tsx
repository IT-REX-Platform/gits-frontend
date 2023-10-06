"use client";

import { Chip, Typography } from "@mui/material";
import {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  createContext,
  useContext,
} from "react";

export type ContentSize = "small" | "normal";
export type ContentChip = {
  key: string;
  label: string;
  color?: string;
};

export const ContentLinkProps = createContext({
  disabled: false,
  chips: [] as ContentChip[],
  size: "normal" as ContentSize,
});

export function ContentBase({
  type,
  title,
  icon,
  color,
  iconFrame,
  className = "",
  onClick = undefined,
  action,
  square = false,
}: {
  type?: string;
  title: string;
  icon: ReactElement;
  color?: string;
  iconFrame: ReactElement;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  action?: ReactNode;
  square?: boolean;
}) {
  const { disabled, chips, size } = useContext(ContentLinkProps);
  const chips_ = [
    ...(type ? [{ key: "type", label: type, color }] : []),
    ...chips,
  ];

  const gap = size == "small" ? "gap-2" : "gap-4";
  const rounding = !square
    ? "rounded-full"
    : size == "small"
    ? "rounded"
    : "rounded-xl";
  const cursor = !disabled ? "cursor-pointer" : "cursor-default";
  const frameSize = size == "small" ? "w-10 h-10" : "w-16 h-16";

  return (
    <button
      disabled={disabled}
      className={`group flex items-center text-left ${gap} pr-3 bg-transparent hover:disabled:bg-gray-50 ${cursor} ${rounding} ${className}`}
      onClick={onClick}
    >
      <div
        className={`${frameSize} relative flex justify-center items-center group-hover:group-enabled:scale-105`}
      >
        {iconFrame}
        <div className="absolute flex justify-center">{icon}</div>
      </div>
      <div className="group-hover:group-enabled:translate-x-0.5">
        <div
          className={`flex items-center ${
            size == "small" ? "gap-1 -ml-0.5" : "gap-1.5 -ml-1"
          }`}
        >
          {chips_.map((chip) => (
            <Chip
              key={chip.key}
              className={
                size == "small" ? "!h-3.5 !text-[0.6rem]" : "!h-5 text-xs"
              }
              label={chip.label}
              sx={{ backgroundColor: chip.color }}
              classes={{ label: size == "small" ? "!px-2 mt-[0.1rem]" : "" }}
            />
          ))}
        </div>
        <Typography
          variant="subtitle1"
          fontSize={size == "small" ? "0.8rem" : "1.25rem"}
          fontWeight="500"
          color={disabled ? "text.disabled" : ""}
          sx={size == "small" ? { lineHeight: 1.5 } : { marginBottom: -0.5 }}
        >
          {title}
        </Typography>
      </div>
      <div className="flex-1"></div>
      {action}
    </button>
  );
}
