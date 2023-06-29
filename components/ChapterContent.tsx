import { useTheme } from "@mui/material";
import { ReactElement } from "react";

export function ChapterContent({ children }: { children: any }) {
  const theme = useTheme();
  return <div>{children}</div>;
}

export function ChapterContentItem({
  children,
  disabled = false,
  finished = false,
  first = false,
  last = false,
}: {
  children: ReactElement[] | ReactElement;
  disabled?: boolean;
  finished?: boolean;
  first?: boolean;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <div className={`flex ${first ? "pt-8" : ""}`}>
      <div className="item-start ml-[1.375rem] w-20 mr-4 flex flex-col">
        <div
          className={`${
            first ? "h-[5.375rem] -mt-8" : "h-[3.375rem]"
          } border-l-4 border-b-4`}
          style={{
            borderColor: disabled
              ? theme.palette.grey["200"]
              : theme.palette.success.main,
          }}
        ></div>
        <div
          className={`grow ${last ? "" : "border-l-4"}`}
          style={{
            borderColor: finished
              ? theme.palette.success.main
              : theme.palette.grey["200"],
          }}
        ></div>
      </div>
      <div className="py-5 grid gap-x-12 gap-y-4 grid-cols-[max-content] xl:grid-cols-[repeat(2,max-content)] 2xl:grid-cols-[repeat(3,max-content)]">
        {children}
      </div>
    </div>
  );
}
