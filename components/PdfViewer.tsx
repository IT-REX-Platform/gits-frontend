"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

import { CircularProgress, Pagination } from "@mui/material";
import { useEffect, useState } from "react";

export function PdfViewer({
  url,
  onProgressChange,
}: {
  url: string;
  onProgressChange: (fraction: number) => void;
}) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [_, setViewedPages] = useState([] as number[]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (numPages) {
        setViewedPages((x) => {
          // add to viewed pages
          const newState = x.includes(pageNumber) ? x : [...x, pageNumber];
          // update progress
          onProgressChange(newState.length / numPages);

          return newState;
        });
      }
    }, 5_000);

    return () => clearTimeout(timeout);
  }, [pageNumber, numPages, onProgressChange]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div>
      <Document
        className="flex justify-center"
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<CircularProgress />}
      >
        <Page
          loading={<CircularProgress />}
          pageNumber={pageNumber}
          height={600}
        />
      </Document>
      <div className="flex justify-center items-center gap-2 mt-6">
        <Pagination
          count={numPages}
          onChange={(_, val) => setPageNumber(val)}
          color="primary"
        />
      </div>
    </div>
  );
}
