import { Done } from "@mui/icons-material";
import { ReactNode } from "react";

export function Topic({ children }: { children: ReactNode }) {
  return (
    <div className="border-gray-200 w-fit flex flex-col shrink-0">
      {children}
    </div>
  );
}

export function TopicHeader({
  children,
  done = false,
}: {
  children: ReactNode;
  done?: boolean;
}) {
  return (
    <div className="flex gap-4 items-center mb-4">
      <div className="bg-gray-200 px-12 py-2 h-full rounded-xl text-center self-start">
        {children}
      </div>
      {done && <Done className="text-green-600" />}
    </div>
  );
}

export function TopicContent({ children }: { children: ReactNode }) {
  return <div className="grow py-4">{children}</div>;
}
