"use client";
import { Typography } from "@mui/material";
import { ReactElement, ReactNode } from "react";

export function FormDivider() {
  return <hr className="col-span-2 my-2" />;
}

export function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <FormDivider />
      <div>
        <Typography className="pl-4 pt-2">{title}</Typography>
        <div className="pl-4 pt-2 !max-w-[200px] w-max break-words text-[10px] text-gray-500">
          {subtitle}
        </div>
      </div>
      <div className="flex flex-col gap-3 items-start pr-4">{children}</div>
    </>
  );
}

export function FormActions({
  children,
}: {
  children: ReactElement | ReactElement[];
}) {
  return (
    <>
      <FormDivider />
      <div></div>
      <div className="flex gap-2 items-center">{children}</div>
    </>
  );
}

export function Form({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-[max-content_auto] gap-3 gap-x-24 w-fit">
      {children}
    </div>
  );
}
