import { ReactNode, RefObject } from "react";

export function AutosizeByText({
  className = "",
  value,
  fontRef,
  children,
  factor = 1.025,
  offset = 0,
}: {
  className?: string;
  value: string;
  fontRef?: RefObject<HTMLElement>;
  children: ReactNode;
  factor?: number;
  offset?: number;
}) {
  const font = fontRef?.current ? getCanvasFont(fontRef.current) : "";
  const width = `${getTextWidth(value, font) * factor + offset}px`;

  return (
    <div
      className={`inline-block overflow-hidden ${className}`}
      style={{ width }}
    >
      {children}
    </div>
  );
}

let _canvas: HTMLCanvasElement | null = null;
function getTextWidth(text: string, font: string) {
  // re-use canvas object for better performance
  const canvas = _canvas || (_canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d")!;
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

function getCssStyle(element: HTMLElement, prop: string) {
  return window.getComputedStyle(element, null).getPropertyValue(prop);
}

function getCanvasFont(el = document.body) {
  const fontWeight = getCssStyle(el, "font-weight") || "normal";
  const fontSize = getCssStyle(el, "font-size") || "16px";
  const fontFamily = getCssStyle(el, "font-family") || "Times New Roman";

  return `${fontWeight} ${fontSize} ${fontFamily}`;
}
