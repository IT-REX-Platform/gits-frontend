import { Done } from "@mui/icons-material";
import { ReactNode } from "react";

export function WorkPath({
  children,
  done = false,
}: {
  children: ReactNode;
  done?: boolean;
}) {
  return (
    <div className="border-gray-200 w-fit flex flex-col shrink-0">
      {children}
      {done && <WorkPathDone />}
    </div>
  );
}

export function WorkPathHeader({
  children,
  action,
}: {
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`flex gap-2 items-center ${children ? "mb-4" : "mb-1"}`}>
      {children && (
        <div className="bg-gray-200 px-12 py-2 h-full rounded-xl text-center self-start">
          {children}
        </div>
      )}
      {action}
    </div>
  );
}

export function WorkPathContent({ children }: { children: ReactNode }) {
  return <div className="grow py-4">{children}</div>;
}

function WorkPathDone() {
  return (
    <div className="flex items-stretch">
      <div className="w-8 mr-4 py-4 flex justify-center">
        <Done className="text-green-600" />
      </div>
      <div className="grow mr-4 flex items-center text-gray-400">
        Work path completed
      </div>
    </div>
  );
}
