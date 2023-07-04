"use client";
import React from "react";

export function Subheading(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className={
        "text-3xl font-extrabold tracking-wide px-10 pt-10 pb-5 " +
        props.className
      }
    />
  );
}
