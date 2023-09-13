"use client";
import { MediaContentModal$key } from "@/__generated__/MediaContentModal.graphql";
import { MediaContentModalCreateMutation } from "@/__generated__/MediaContentModalCreateMutation.graphql";
import { MediaContentModalUpdateMutation } from "@/__generated__/MediaContentModalUpdateMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { Form, FormSection } from "@/components/Form";
import { Add, Delete } from "@mui/icons-material";
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "./ContentMetadataFormSection";
import { MediaRecordIcon } from "./MediaRecordIcon";
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
        __id
        metadata {
          name
          rewardPoints
          suggestedDate
          chapterId
        }
        mediaRecords {
          id
          __id
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

  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);

  const [selectedRecords, setSelectedRecords] = useState(
    existingContent?.mediaRecords ?? []
  );

  const [error, setError] = useState<any>(null);

  const [addMedia, isAdding] =
    useMutation<MediaContentModalCreateMutation>(graphql`
      mutation MediaContentModalCreateMutation(
        $input: CreateContentMetadataInput!
        $records: [UUID!]!
      ) {
        createMediaContentAndLinkRecords(
          contentInput: { metadata: $input }
          mediaRecordIds: $records
        ) {
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
        $contentId: UUID!
        $input: UpdateMediaContentInput!
        $records: [UUID!]!
      ) {
        mutateContent(contentId: $contentId) {
          updateMediaContent(input: $input) {
            id
            ...ContentVideoFragment
            userProgressData {
              nextLearnDate
            }
            __typename
          }
        }
        linkMediaRecordsWithContent(
          contentId: $contentId
          mediaRecordIds: $records
        ) {
          id
        }
      }
    `);

  function onClose() {
    setMetadata(null);
    _onClose();
  }

  function handleSubmit() {
    if (existingContent && metadata) {
      updateMedia({
        variables: {
          contentId: existingContent.id,
          input: {
            metadata: {
              chapterId: existingContent.metadata.chapterId,
              ...metadata,
            },
          },
          records: selectedRecords.map((r) => r.id),
        },
        onCompleted() {
          onClose();
        },
        onError(error) {
          setError(error);
        },
        updater(store) {
          const content = store.get(existingContent.__id);
          const records = selectedRecords.map((r) => store.get(r.__id)!);
          content!.setLinkedRecords(records, "mediaRecords");
        },
      });
    } else if (metadata) {
      addMedia({
        variables: {
          input: {
            chapterId,
            type: "MEDIA",
            ...metadata,
          },
          records: selectedRecords.map((r) => r.id),
        },
        onCompleted() {
          onClose();
        },
        onError(error) {
          setError(error);
        },
        updater(store, data) {
          const chapter = store.get(chapterId!);
          const newRecord = store.get(data.createMediaContentAndLinkRecords.id);
          const linkedRecords = chapter!.getLinkedRecords("contents");
          chapter!.setLinkedRecords(
            [...(linkedRecords ?? []), newRecord!],
            "contents"
          );
        },
      });
    }
  }
  const [recordSelectorOpen, setRecordSelectorOpen] = useState(false);

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
          <ContentMetadataFormSection
            metadata={metadata}
            onChange={setMetadata}
          />

          <FormSection title="Media files">
            <MediaRecordSelector
              isOpen={recordSelectorOpen}
              onClose={() => setRecordSelectorOpen(false)}
              mode="multiple"
              _mediaRecords={_mediaRecords}
              selectedRecords={selectedRecords}
              setSelectedRecords={setSelectedRecords}
            />

            <div className="w-full">
              <List>
                {selectedRecords.map((record) => (
                  <ListItem
                    key={record.id}
                    secondaryAction={
                      <IconButton
                        onClick={() =>
                          setSelectedRecords(
                            selectedRecords.filter((x) => x !== record.id)
                          )
                        }
                        edge="end"
                        aria-label="delete"
                      >
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <MediaRecordIcon type={record.type} />
                    </ListItemIcon>
                    <ListItemText primary={record.name} />
                  </ListItem>
                ))}
              </List>

              <Button
                onClick={() => setRecordSelectorOpen(true)}
                startIcon={<Add />}
                size="small"
                className="float-right"
              >
                Add Files
              </Button>
            </div>
          </FormSection>
        </Form>
        <Backdrop open={isAdding || isUpdating} sx={{ zIndex: "modal" }}>
          <CircularProgress />
        </Backdrop>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!metadata} onClick={handleSubmit}>
          {_existingMediaContent ? "Save" : "Add"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
