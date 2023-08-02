"use client";

import {
  MediaRecordSelector$data,
  MediaRecordSelector$key,
} from "@/__generated__/MediaRecordSelector.graphql";
import {
  MediaRecordSelectorCreateMediaRecordMutation,
  MediaType,
} from "@/__generated__/MediaRecordSelectorCreateMediaRecordMutation.graphql";
import { MediaRecordSelectorDeleteMediaRecordMutation } from "@/__generated__/MediaRecordSelectorDeleteMediaRecordMutation.graphql";
import {
  Add,
  Delete,
  Download,
  Error,
  FileUploadOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { MediaRecordTypeSelector } from "./MediaRecordTypeSelector";
import { MediaRecordIcon } from "./MediaRecordIcon";

export function MediaRecordSelector({
  _mediaRecords,
  selectedRecords,
  setSelectedRecords,
}: {
  _mediaRecords: MediaRecordSelector$key;
  selectedRecords: MediaRecordSelector$data["mediaRecords"];
  setSelectedRecords: (
    val:
      | MediaRecordSelector$data["mediaRecords"]
      | ((
          val: MediaRecordSelector$data["mediaRecords"]
        ) => MediaRecordSelector$data["mediaRecords"])
  ) => void;
}) {
  const [error, setError] = useState<any>(null);

  const { mediaRecords } = useFragment(
    graphql`
      fragment MediaRecordSelector on Query {
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
    _mediaRecords
  );

  const [createMediaRecord] =
    useMutation<MediaRecordSelectorCreateMediaRecordMutation>(graphql`
      mutation MediaRecordSelectorCreateMediaRecordMutation(
        $input: CreateMediaRecordInput!
      ) {
        createMediaRecord(input: $input) {
          id
          __id
          uploadUrl
          name
          downloadUrl
          contentIds
          type
        }
      }
    `);

  const [deleteMediaRecord] =
    useMutation<MediaRecordSelectorDeleteMediaRecordMutation>(graphql`
      mutation MediaRecordSelectorDeleteMediaRecordMutation($id: UUID!) {
        deleteMediaRecord(id: $id)
      }
    `);

  const [isOpen, setIsOpen] = useState(false);
  function onClose() {
    setIsOpen(false);
  }

  const [fileUploadStates, setFileUploadStates] = useState<
    Record<string, "running" | "failed" | "done">
  >({});
  const [files, setFiles] = useState<File[]>([]);

  const uploadFile = useCallback(
    async (file: File, type: MediaType) => {
      await createMediaRecord({
        variables: {
          input: { contentIds: [], name: file.name, type },
        },
        onCompleted(record) {
          setFileUploadStates((x) => ({
            ...x,
            [record.createMediaRecord.id]: "running",
          }));
          fetch(record.createMediaRecord.uploadUrl, {
            method: "PUT",
            body: file,
          })
            .then(() => {
              setFileUploadStates((x) => ({
                ...x,
                [record.createMediaRecord.id]: "done",
              }));
              setSelectedRecords((x) => [...x, record.createMediaRecord]);
            })
            .catch(() =>
              setFileUploadStates((x) => ({
                ...x,
                [record.createMediaRecord.id]: "failed",
              }))
            );
        },
        updater(store, data) {
          const rootStore = store.getRoot();
          const mediaRecords = rootStore.getLinkedRecords("mediaRecords");
          const newRecord = store.get(data.createMediaRecord.id);
          rootStore.setLinkedRecords(
            [...(mediaRecords ?? []), newRecord!],
            "mediaRecords"
          );
        },
      });
    },
    [createMediaRecord, setSelectedRecords]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        let type: MediaType;

        if (file.type.includes("video")) {
          type = "VIDEO";
        } else if (file.type.includes("audio")) {
          type = "AUDIO";
        } else if (file.type.includes("image")) {
          type = "IMAGE";
        } else if (
          [
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-powerpoint",
            "application/vnd.oasis.opendocument.presentation",
          ].includes(file.type)
        ) {
          type = "PRESENTATION";
        } else {
          setFiles((files) => [...files, file]);
          continue;
        }

        console.log("uploading file of type ", type);
        await uploadFile(file, type);
      }
    },
    [setFiles, uploadFile]
  );

  const onTypeSelect = useCallback(
    async (type: MediaType) => {
      const file = files[0];
      setFiles(([_, ...files]) => files);
      await uploadFile(file, type);
    },
    [files, uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const [search, setSearch] = useState("");

  const filteredMedia = mediaRecords.filter(
    (x) => !search || x.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Add media</DialogTitle>

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

        <div
          className="m-2 flex  items-center gap-8 w-[500px] min-h-36 bg-slate-100 shadow-inner hover:bg-slate-200 p-8 rounded-md border border-dashed border-slate-500 cursor-pointer"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <FileUploadOutlined />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag & drop some files here, or click to select files</p>
          )}
        </div>
        <TextField
          id="outlined-basic"
          className="grow"
          label="Search Media"
          variant="outlined"
          sx={{ margin: "8px" }}
          value={search}
          onChange={(x) => setSearch(x.target.value)}
        />
        <DialogContent sx={{ paddingX: 0 }}>
          <List>
            {filteredMedia.map((record) => {
              const checked = selectedRecords.find((x) => x.id === record.id);
              const toggle = () =>
                setSelectedRecords(
                  checked
                    ? selectedRecords.filter((x) => x.id !== record.id)
                    : [...selectedRecords, record]
                );

              return (
                <ListItem
                  key={record.id}
                  secondaryAction={
                    <div className="mr-2">
                      <Checkbox
                        size="small"
                        checked={!!checked}
                        onClick={toggle}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          setFileUploadStates((x) => ({
                            ...x,
                            [record.id]: "loading",
                          }));

                          deleteMediaRecord({
                            variables: { id: record.id },
                            updater(store, data) {
                              const rootStore = store.getRoot();
                              const mediaRecords =
                                rootStore.getLinkedRecords("mediaRecords");

                              rootStore.setLinkedRecords(
                                mediaRecords?.filter(
                                  (x) => x.getDataID() === record.id
                                ),
                                "mediaRecords"
                              );
                            },
                            onError() {
                              setFileUploadStates((x) => ({
                                ...x,
                                [record.id]: "failed",
                              }));
                            },
                          });
                        }}
                        edge="end"
                        aria-label="delete"
                      >
                        <Delete />
                      </IconButton>

                      {fileUploadStates[record.id] === "running" ? (
                        <CircularProgress size={18}></CircularProgress>
                      ) : fileUploadStates[record.id] === "failed" ? (
                        <Error color="error" />
                      ) : (
                        <IconButton
                          edge="end"
                          aria-label="comments"
                          href={record.downloadUrl}
                        >
                          <Download />
                        </IconButton>
                      )}
                    </div>
                  }
                  disablePadding
                >
                  <ListItemButton onClick={toggle}>
                    <ListItemIcon>
                      <MediaRecordIcon type={record.type} />
                    </ListItemIcon>
                    <ListItemText primary={record.name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Ok</Button>
        </DialogActions>
      </Dialog>

      <div className="w-full">
        <List>
          {mediaRecords
            .filter((x) => selectedRecords.some((y) => y.id === x.id))
            .map((record) => (
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
          onClick={() => setIsOpen(true)}
          startIcon={<Add />}
          size="small"
          className="float-right"
        >
          Add Files
        </Button>
        {files.length > 0 && (
          <MediaRecordTypeSelector
            open
            file={files[0]}
            onClose={() => setFiles(([_, ...files]) => files)}
            onSelect={onTypeSelect}
          />
        )}
      </div>
    </>
  );
}
