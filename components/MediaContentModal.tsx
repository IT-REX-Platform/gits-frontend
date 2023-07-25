"use client";
import { MediaContentModal$key } from "@/__generated__/MediaContentModal.graphql";
import { MediaContentModalCreateMutation } from "@/__generated__/MediaContentModalCreateMutation.graphql";
import { MediaContentModalUpdateMutation } from "@/__generated__/MediaContentModalUpdateMutation.graphql";
import { MediaContentModalUpdateRecordMutation } from "@/__generated__/MediaContentModalUpdateRecordMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { Form, FormSection } from "@/components/Form";
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { uniq } from "lodash";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { MediaRecordSelector } from "./MediaRecordSelector";

export function MediaContentModal({
  onClose: _onClose,
  _existingMediaContent,
  chapterId,
  isOpen,
  _mediaRecords,
}: {
  onClose: () => void;
  isOpen: boolean;
  chapterId?: string;
  _existingMediaContent?: MediaContentModal$key;
  _mediaRecords: MediaRecordSelector$key;
}) {
  const existingContent = useFragment(
    graphql`
      fragment MediaContentModal on MediaContent {
        id
        metadata {
          name
          rewardPoints
          suggestedDate
          chapterId
        }
        mediaRecords {
          id
          uploadUrl
          name
          downloadUrl
          contentIds
          type
        }
      }
    `,
    _existingMediaContent ?? null
  );

  const [title, setTitle] = useState(existingContent?.metadata.name ?? "");
  const [suggestedDate, setSuggestedDate] = useState<Dayjs | null>(
    dayjs(existingContent?.metadata.suggestedDate)
  );
  const [rewardPoints, setRewardPoints] = useState(
    existingContent?.metadata.rewardPoints ?? 0
  );

  const [selectedRecords, setSelectedRecords] = useState(
    existingContent?.mediaRecords ?? []
  );

  const [error, setError] = useState<any>(null);

  const valid =
    title !== "" &&
    suggestedDate != null &&
    suggestedDate.isValid() &&
    !isNaN(rewardPoints);

  const [addMedia, isAdding] =
    useMutation<MediaContentModalCreateMutation>(graphql`
      mutation MediaContentModalCreateMutation(
        $input: CreateContentMetadataInput!
      ) {
        createMediaContent(input: { metadata: $input }) {
          id
          ...ContentVideoFragment
          userProgressData {
            nextLearnDate
          }
          metadata {
            chapterId
            name
            rewardPoints
            suggestedDate
          }
          mediaRecords {
            id
            name
            downloadUrl
            type
          }
          __typename
        }
      }
    `);

  const [updateMedia, isUpdating] =
    useMutation<MediaContentModalUpdateMutation>(graphql`
      mutation MediaContentModalUpdateMutation(
        $input: UpdateMediaContentInput!
      ) {
        updateMediaContent(input: $input) {
          id
          ...ContentVideoFragment
          userProgressData {
            nextLearnDate
          }
          __typename
        }
      }
    `);
  const [updateMediaRecord] =
    useMutation<MediaContentModalUpdateRecordMutation>(graphql`
      mutation MediaContentModalUpdateRecordMutation(
        $input: UpdateMediaRecordInput!
      ) {
        updateMediaRecord(input: $input) {
          id
        }
      }
    `);

  function onClose() {
    setTitle("");
    setSuggestedDate(dayjs());
    setRewardPoints(0);
    _onClose();
  }

  function handleSubmit() {
    // TODO ugly workaround until we have a proper mutation to do this in one pass
    const updateRecords = async (contentId: string) => {
      for (const record of selectedRecords) {
        await updateMediaRecord({
          variables: {
            input: {
              id: record.id,
              contentIds: uniq([...record.contentIds, contentId]),
              name: record.name,
              type: record.type,
            },
          },
        });
      }

      const removedRecords =
        existingContent?.mediaRecords.filter(
          (r) => !selectedRecords.map((sr) => sr.id).includes(r.id)
        ) ?? [];
      for (const record of removedRecords) {
        await updateMediaRecord({
          variables: {
            input: {
              id: record.id,
              contentIds: uniq([
                ...record.contentIds.filter(
                  (cid) => cid != existingContent!.id
                ),
              ]),
              name: record.name,
              type: record.type,
            },
          },
        });
      }
    };

    if (existingContent) {
      updateMedia({
        variables: {
          input: {
            id: existingContent.id,
            metadata: {
              chapterId: existingContent.metadata.chapterId,
              name: title,
              rewardPoints,
              suggestedDate: suggestedDate!.toISOString(),
              tagNames: [],
            },
          },
        },
        onCompleted({ updateMediaContent: { id } }) {
          updateRecords(id);
          onClose();
        },
        onError(error) {
          setError(error);
        },
      });
    } else {
      addMedia({
        variables: {
          input: {
            chapterId,
            name: title,
            rewardPoints,
            suggestedDate: suggestedDate!.toISOString(),
            tagNames: [],
            type: "MEDIA",
          },
        },
        onCompleted({ createMediaContent: { id } }) {
          updateRecords(id);
          onClose();
        },
        onError(error) {
          setError(error);
        },
        updater(store, data) {
          const chapter = store.get(chapterId!);
          const newRecord = store.get(data.createMediaContent.id);
          const linkedRecords = chapter!.getLinkedRecords("contents");
          chapter!.setLinkedRecords(
            [...(linkedRecords ?? []), newRecord!],
            "contents"
          );
        },
      });
    }
  }

  return (
    <Dialog maxWidth="lg" open={isOpen} onClose={onClose}>
      <DialogTitle>Add media</DialogTitle>
      <DialogContent>
        {error?.source.errors.map((err: any, i: number) => (
          <Alert key={i} severity="error" onClose={() => setError(null)}>
            {err.message}
          </Alert>
        ))}
        <Form>
          <FormSection title="General">
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-96"
              label="Name"
              variant="outlined"
              required
            />
          </FormSection>

          <FormSection title="Scoring">
            <TextField
              value={rewardPoints}
              onChange={(e) => setRewardPoints(Number(e.target.value))}
              className="w-96"
              label="Reward points"
              variant="outlined"
              required
              type="number"
            />
            <DatePicker
              value={suggestedDate}
              onChange={setSuggestedDate}
              slotProps={{
                textField: {
                  required: true,
                  error: suggestedDate == null || !suggestedDate.isValid(),
                },
              }}
              label="Suggested completion date"
            />
          </FormSection>
          <FormSection title="Media files">
            <MediaRecordSelector
              _mediaRecords={_mediaRecords}
              selectedRecords={selectedRecords}
              setSelectedRecords={setSelectedRecords}
            />
          </FormSection>
        </Form>
        <Backdrop open={isAdding || isUpdating} sx={{ zIndex: "modal" }}>
          <CircularProgress />
        </Backdrop>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!valid} onClick={handleSubmit}>
          {_existingMediaContent ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
