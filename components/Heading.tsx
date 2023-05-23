import React from "react";

export function Heading(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className={
        "text-3xl font-black tracking-wide px-10 pt-10 pb-4 " + props.className
      }
    />
  );
}
