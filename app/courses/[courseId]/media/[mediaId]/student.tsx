"use client";

import { studentContentDownloadButtonFragment$key } from "@/__generated__/studentContentDownloadButtonFragment.graphql";
import { studentContentMediaDisplayFragment$key } from "@/__generated__/studentContentMediaDisplayFragment.graphql";
import { studentMediaLogProgressMutation } from "@/__generated__/studentMediaLogProgressMutation.graphql";
import { studentMediaQuery } from "@/__generated__/studentMediaQuery.graphql";
import { MediaContent } from "@/components/Content";
import { Heading } from "@/components/Heading";
import { PdfViewer } from "@/components/PdfViewer";
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
import Error from "next/error";
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
    return <Error statusCode={404} />;
  }

  if (content.metadata.type !== "MEDIA") {
    return <Error statusCode={400} />;
  }
  if (!content.mediaRecords || content.mediaRecords.length == 0) {
    return <Error statusCode={404} />;
  }

  if (mainRecord == null) {
    return <Error statusCode={404} />;
  }

  const relatedRecords = content.mediaRecords.filter(
    (record) => record.id !== mainRecord.id
  );

  return (
    <main className="flex flex-col h-full">
      <Heading
        title={mainRecord.name}
        overline={content.metadata.name}
        action={<DownloadButton _record={mainRecord} />}
        backButton
      />

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

      <Dialog open={progress > 0.8 && !workedOnToday && !nagDismissed}>
        <DialogTitle>Do you want to mark this as understood?</DialogTitle>
        <DialogContent>
          You&apos;ve completed more than 80% of this content - this could be a
          good time to mark it as completed.
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

  return (
    <Button
      href={mediaRecord.downloadUrl}
      target="_blank"
      download={mediaRecord.name}
      sx={{ color: "text.secondary" }}
      startIcon={<Download />}
    >
      Download
    </Button>
  );
}
