"use client";

import { useEffect, useRef, useState } from "react";
import PDFObject from "pdfobject";

export function PdfViewer({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
      )
      .then((b64) =>
        b64.replace("application/x-www-form-urlencoded", "application/pdf")
      )
      .then((b64) => setData(b64));
  }, [url]);

  useEffect(() => {
    if (ref.current && data) {
      PDFObject.embed(data, ref.current);
    }
  }, [ref, data]);

  return <div ref={ref} className="h-full h-[48rem] max-h-[90vh]"></div>;
}
