"use client";

import { useEffect, useRef } from "react";
import PDFObject from "pdfobject";

export function PdfViewer({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      PDFObject.embed(url, ref.current);
    }
  }, [ref, url]);

  return <div ref={ref} className="h-full h-[48rem] max-h-[90vh]"></div>;
}
