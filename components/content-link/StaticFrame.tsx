"use client";

export function StaticFrame({ color }: { color?: string }) {
  return <div className={`w-4/5 h-4/5 rounded ${color ?? ""}`}></div>;
}
