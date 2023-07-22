import { ReactNode } from "react";
import { Lock } from "@mui/icons-material";

export function TopicStage({
  children,
  progress,
}: {
  children: ReactNode;
  progress: number;
}) {
  return (
    <div className="group flex items-stretch">
      <div className="w-16 flex justify-center group-first:-mt-2 group-last:-mb-2 relative shrink-0">
        <div
          className={`h-full border-l-4 group-first:rounded-t-full group-last:rounded-b-full border-gray-200 border-dotted`}
        ></div>
        <div
          className={`absolute border-l-4 group-first:rounded-t-full group-last:rounded-b-full ${
            progress < 100 ? "rounded-b-full" : ""
          } border-green-600`}
          style={{ height: `${progress}%` }}
        ></div>
      </div>
      <div className="py-4 mr-4 border-b group-first:border-t border-gray-200 grow flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

export function TopicStageBarrier() {
  return (
    <div className="flex items-stretch">
      <div className="w-16 py-4 flex justify-center">
        <Lock className="text-gray-300" />
      </div>
      <div className="grow mr-4 border-b border-gray-200 flex items-center text-gray-400">
        Complete previous stage to proceed
      </div>
    </div>
  );
}
