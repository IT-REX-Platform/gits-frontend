"use client";
import { Typography } from "@mui/material";
import { ReactElement, ReactNode } from "react";

export function FormDivider() {
  return <hr className="col-span-2 my-2" />;
}

export function FormSection({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <>
      <FormDivider />
      <Typography className="pl-4 pt-2">{title}</Typography>
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
