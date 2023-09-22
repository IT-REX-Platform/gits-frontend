"use client";

import { studentContentDownloadButtonFragment$key } from "@/__generated__/studentContentDownloadButtonFragment.graphql";
import { studentContentMediaDisplayFragment$key } from "@/__generated__/studentContentMediaDisplayFragment.graphql";
import { studentMediaLogProgressMutation } from "@/__generated__/studentMediaLogProgressMutation.graphql";
import { studentMediaQuery } from "@/__generated__/studentMediaQuery.graphql";
import { MediaContent } from "@/components/Content";
import { ContentTags } from "@/components/ContentTags";
import { Heading } from "@/components/Heading";
import { DisplayError, PageError } from "@/components/PageError";
import { PdfViewer } from "@/components/PdfViewer";
import { isUUID } from "@/src/utils";
import { Check, Download } from "@mui/icons-material";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { differenceInHours } from "date-fns";
import { first } from "lodash";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

export default function StudentMediaPage() {
  const { mediaId } = useParams();
  if (!isUUID(mediaId)) {
    return <PageError message="Invalid media id" />;
  }
  return <_StudentMediaPage />;
}

function _StudentMediaPage() {
  const { mediaId } = useParams();
  const searchParams = useSearchParams();
  const media = useLazyLoadQuery<studentMediaQuery>(
    graphql`
      query studentMediaQuery($mediaId: UUID!) {
        contentsByIds(ids: [$mediaId]) {
          metadata {
            name
            type
            ...ContentTags
          }
          ... on MediaContent {
            mediaRecords {
              id
              name
              ...studentContentMediaDisplayFragment
              ...studentContentDownloadButtonFragment
              userProgressData {
                dateWorkedOn
              }
            }
          }

          ...ContentMediaFragment
        }
      }
    `,
    { mediaId }
  );

  const recordId = searchParams.get("recordId");

  const content = media.contentsByIds[0];

  const mainRecord = recordId
    ? content?.mediaRecords?.find((record) => record.id === recordId)
    : first(content?.mediaRecords ?? []);

  const [mediaRecordWorkedOn] =
    useMutation<studentMediaLogProgressMutation>(graphql`
      mutation studentMediaLogProgressMutation($id: UUID!) {
        logMediaRecordWorkedOn(mediaRecordId: $id) {
          id
          userProgressData {
            dateWorkedOn
          }
        }
      }
    `);

  const workedOnToday =
    Math.abs(
      differenceInHours(
        new Date(),
        new Date(mainRecord?.userProgressData.dateWorkedOn ?? "")
      )
    ) < 24;

  const [nagDismissed, setNagDismissed] = useState(false);

  useEffect(() => {
    setNagDismissed(false);
    setProgress(0);
  }, [mainRecord?.id]);

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<any>(null);

  if (media.contentsByIds.length == 0) {
    return <PageError message="No content found with given id." />;
  }

  if (content.metadata.type !== "MEDIA") {
    return <PageError message="Wrong content type." />;
  }
  if (!content.mediaRecords) {
    return <PageError message="Content has no media records." />;
  }

  if (recordId && mainRecord == null) {
    return <PageError message="Content has no record with given id." />;
  }

  const relatedRecords = content.mediaRecords.filter(
    (record) => record.id !== mainRecord?.id
  );

  return (
    <main className="flex flex-col h-full">
      <Heading
        title={mainRecord?.name ?? content.metadata.name}
        overline={mainRecord != null ? content.metadata.name : undefined}
        action={
          mainRecord ? <DownloadButton _record={mainRecord} /> : undefined
        }
        backButton
      />

      <ContentTags metadata={content.metadata} />

      {error?.source.errors.map((err: any, i: number) => (
        <Alert
          key={i}
          severity="error"
          sx={{ minWidth: 400, maxWidth: 800, width: "fit-content" }}
          onClose={() => setError(null)}
        >
          {err.message}
        </Alert>
      ))}

      {mainRecord && (
        <>
          <Dialog open={progress > 0.8 && !workedOnToday && !nagDismissed}>
            <DialogTitle>Do you want to mark this as understood?</DialogTitle>
            <DialogContent>
              You&apos;ve completed more than 80% of this content - this could
              be a good time to mark it as completed.
            </DialogContent>
            <DialogActions>
              <Button variant="text" onClick={() => setNagDismissed(true)}>
                No thanks
              </Button>
              <Button
                variant="text"
                onClick={() =>
                  mediaRecordWorkedOn({
                    variables: { id: mainRecord.id },
                    onError: setError,
                  })
                }
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
          <div className="my-8 grow">
            <ContentMediaDisplay
              onProgressChange={setProgress}
              _record={mainRecord}
            />
            <div className="w-full flex justify-center mt-10">
              <Button
                disabled={progress < 0.5 || workedOnToday}
                onClick={() =>
                  mediaRecordWorkedOn({
                    variables: { id: mainRecord.id },
                    onError: setError,
                  })
                }
              >
                {workedOnToday && <Check className="mr-2" />}
                {workedOnToday
                  ? "Understood"
                  : progress >= 0.5
                  ? "Mark content as understood"
                  : "Complete more than 50% to mark as understood"}
              </Button>
            </div>
          </div>
        </>
      )}
      {!mainRecord && <DisplayError message="Content has no media records." />}

      {relatedRecords.length > 0 && (
        <>
          <Typography variant="h2">Related media</Typography>
          <div className="mt-4 flex flex-col gap-2">
            {relatedRecords.map((record) => (
              <MediaContent
                key={record.id}
                _media={content}
                recordId={record.id}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export function ContentMediaDisplay({
  _record,
  onProgressChange,
}: {
  _record: studentContentMediaDisplayFragment$key;
  onProgressChange: (fraction: number) => void;
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

  const [duration, setDuration] = useState<number>();

  switch (mediaRecord.type) {
    case "VIDEO":
      return (
        <ReactPlayer
          url={mediaRecord.downloadUrl}
          width="100%"
          height="auto"
          controls
          onDuration={(duration) => {
            setDuration(duration);
          }}
          onProgress={(progress) => {
            if (duration) {
              onProgressChange(progress.playedSeconds / duration);
            }
          }}
        />
      );
    case "PRESENTATION":
    case "DOCUMENT":
      return (
        <PdfViewer
          onProgressChange={onProgressChange}
          url={mediaRecord.downloadUrl}
        />
      );
    case "IMAGE":
      return <img src={mediaRecord.downloadUrl}></img>;
    default:
      return <>Unsupported media type</>;
  }
}

export function DownloadButton({
  _record,
}: {
  _record: studentContentDownloadButtonFragment$key;
}) {
  const mediaRecord = useFragment(
    graphql`
      fragment studentContentDownloadButtonFragment on MediaRecord {
        name
        downloadUrl
      }
    `,
    _record
  );

  function downloadFile(url: string, fileName: string) {
    fetch(url, {
      method: "get",
      referrerPolicy: "no-referrer",
    })
      .then((res) => res.blob())
      .then((res) => {
        const aElement = document.createElement("a");
        aElement.setAttribute("download", fileName);
        const href = URL.createObjectURL(res);
        aElement.href = href;
        aElement.setAttribute("target", "_blank");
        aElement.click();
        URL.revokeObjectURL(href);
      });
  }

  return (
    <Button
      href={""}
      target="_blank"
      onClick={() => downloadFile(mediaRecord.downloadUrl, mediaRecord.name)}
      sx={{ color: "text.secondary" }}
      startIcon={<Download />}
    >
      Download
    </Button>
  );
}
