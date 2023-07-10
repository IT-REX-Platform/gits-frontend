"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { IconButton } from "@mui/material";
import { ArrowLeft, ArrowRight, ZoomIn, ZoomOut } from "@mui/icons-material";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export function PdfViewer({ url }: { url: string }) {
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [numPages, setNumPages] = useState(0);

  const controls = (
    <div className="flex justify-center items-center relative gap-4 border-gray-100 border-y-2 py-2 w-full">
      <div className="flex items-center bg-gray-100 rounded-full">
        {/* Zoom-Out Button */}
        <IconButton
          onClick={() => setScale((scale) => scale - 0.1)}
          disabled={scale <= 0.15}
        >
          <ZoomOut fontSize="small" />
        </IconButton>
        {/* Zoom value display */}
        <div className="mx-2">{Math.floor(scale * 100)}%</div>
        {/* Zoom-In Button */}
        <IconButton onClick={() => setScale((scale) => scale + 0.1)}>
          <ZoomIn fontSize="small" />
        </IconButton>
      </div>
      <div className="flex items-center bg-gray-100 rounded-full">
        {/* Previous Page Button */}
        <IconButton
          onClick={() => setPage((page) => page - 1)}
          disabled={page === 1}
        >
          <ArrowLeft />
        </IconButton>
        {/* Page Display */}
        <div className="mx-2">
          Page {!numPages ? 0 : page} of {numPages}
        </div>
        {/* Next Page Button */}
        <IconButton
          onClick={() => setPage((page) => page + 1)}
          disabled={page === numPages}
        >
          <ArrowRight />
        </IconButton>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {controls}
      <Document
        file={url}
        className="w-fit"
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page pageNumber={page} scale={scale} className="w-fit" />
        {
          page < numPages && (
            <Page pageNumber={page + 1} className="hidden" />
          ) /* Preload next page to prevent layout glitches */
        }
      </Document>
    </div>
  );
}
