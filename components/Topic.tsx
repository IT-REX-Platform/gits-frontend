import { ReactNode } from "react";

export function Topic({ children }: { children: ReactNode }) {
  return (
    <div className="border border-gray-200 h-[32rem] w-fit rounded flex flex-col overflow-hidden">
      {children}
    </div>
  );
}

export function TopicHeader({ children }: { children: ReactNode }) {
  return <div className="bg-slate-300 p-4 text-center shadow">{children}</div>;
}

export function TopicContent({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-y-auto grow py-4 thin-scrollbar">{children}</div>
  );
}
