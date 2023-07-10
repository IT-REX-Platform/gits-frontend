"use client";

import { studentContentMediaDisplayFragment$key } from "@/__generated__/studentContentMediaDisplayFragment.graphql";
import { studentMediaQuery } from "@/__generated__/studentMediaQuery.graphql";
import { MediaContent } from "@/components/Content";
import { Heading } from "@/components/Heading";
import { PdfViewer } from "@/components/PdfViewer";
import { Typography } from "@mui/material";
import Error from "next/error";
import { useParams, useSearchParams } from "next/navigation";
import ReactPlayer from "react-player";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";

export default function StudentMediaPage() {
  const { mediaId } = useParams();
  const searchParams = useSearchParams();
  const media = useLazyLoadQuery<studentMediaQuery>(
    graphql`
      query studentMediaQuery($mediaId: UUID!) {
        contentsByIds(ids: [$mediaId]) {
          metadata {
            name
            type
          }
          ... on MediaContent {
            mediaRecords {
              id
              name
              ...studentContentMediaDisplayFragment
            }
          }

          ...ContentMediaFragment
        }
      }
    `,
    { mediaId }
  );

  if (media.contentsByIds.length == 0) {
    return <Error statusCode={404} />;
  }

  const content = media.contentsByIds[0];
  if (content.metadata.type !== "MEDIA") {
    return <Error statusCode={400} />;
  }
  if (!content.mediaRecords || content.mediaRecords.length == 0) {
    return <Error statusCode={404} />;
  }

  const recordId = searchParams.get("recordId");
  const mainRecord = recordId
    ? content.mediaRecords.find((record) => record.id === recordId)
    : content.mediaRecords[0];

  if (mainRecord == null) {
    return <Error statusCode={404} />;
  }

  const relatedRecords = content.mediaRecords.filter(
    (record) => record.id !== mainRecord.id
  );
  return (
    <main>
      <Heading
        title={mainRecord.name}
        overline={content.metadata.name}
        backButton
      />
      <div className="my-8">
        <ContentMediaDisplay _record={mainRecord} />
      </div>
      {relatedRecords.length > 0 && (
        <>
          <Typography variant="h2">Related media</Typography>
          <div className="mt-4">
            {relatedRecords.map((record) => (
              <MediaContent
                key={record.id}
                _media={content}
                recordId={record.id}
                replace
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function ContentMediaDisplay({
  _record,
}: {
  _record: studentContentMediaDisplayFragment$key;
}) {
  const mediaRecord = useFragment(
    graphql`
      fragment studentContentMediaDisplayFragment on MediaRecord {
        type
        downloadUrl
      }
    `,
    _record
  );

  const baseUrl = process.env.NEXT_PUBLIC_MINIO_URL ?? "http://localhost:9000";
  const downloadUrl = new URL(mediaRecord.downloadUrl);
  const url = `${baseUrl}${downloadUrl.pathname}${downloadUrl.search}`;

  switch (mediaRecord.type) {
    case "VIDEO":
      return <VideoPlayer url={url} />;
    case "PRESENTATION":
    case "DOCUMENT":
      return <PdfViewer url={url} />;
    default:
      return <>Unsupported media type</>;
  }
}

function VideoPlayer({ url }: { url: string }) {
  return <ReactPlayer url={url} width="100%" height="auto" controls />;
}
