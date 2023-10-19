"use client";

import {
  MediaRecordSelector$data,
  MediaRecordSelector$key,
} from "@/__generated__/MediaRecordSelector.graphql";
import { MediaRecordSelectorAddToCourseMutation } from "@/__generated__/MediaRecordSelectorAddToCourseMutation.graphql";
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
  ListSubheader,
  TextField,
} from "@mui/material";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { MediaRecordIcon } from "./MediaRecordIcon";
import { MediaRecordTypeSelector } from "./MediaRecordTypeSelector";

type MediaRecord =
  MediaRecordSelector$data["currentUserInfo"]["mediaRecords"][0];

export function MediaRecordSelector({
  _mediaRecords,
  isOpen,
  onClose,
  ...props
}: {
  _mediaRecords: MediaRecordSelector$key;
  isOpen: boolean;
  onClose: () => void;
} & (
  | {
      mode: "multiple";
      selectedRecords: MediaRecord[];
      setSelectedRecords: (
        val: MediaRecord[] | ((val: MediaRecord[]) => MediaRecord[])
      ) => void;
    }
  | {
      mode: "single";
      onSelect: (val: MediaRecord) => void;
    }
)) {
  const [error, setError] = useState<any>(null);

  const {
    currentUserInfo: { mediaRecords: userMediaRecords, id: userId },
    coursesByIds,
  } = useFragment(
    graphql`
      fragment MediaRecordSelector on Query {
        coursesByIds(ids: [$courseId]) {
          id
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

        currentUserInfo {
          id
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

  const courseMediaRecords = coursesByIds[0].mediaRecords;

  const courseMediaRecordIds = courseMediaRecords.map((x) => x.id);

  const recordsNotInCourse = userMediaRecords.filter(
    (x) => !courseMediaRecordIds.includes(x.id)
  );

  const [fileUploadStates, setFileUploadStates] = useState<
    Record<string, "running" | "failed" | "done" | "loading">
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
              setCourseRecords({
                variables: {
                  courseId: coursesByIds[0].id,
                  mediaRecordIds: [
                    ...courseMediaRecordIds,
                    record.createMediaRecord.id,
                  ],
                },
                updater(store, data) {
                  const course = store.get(coursesByIds[0].id);
                  const linkedRecords =
                    course?.getLinkedRecords("mediaRecords");
                  const newRecord = store.get(record.createMediaRecord.id);

                  if (!course || !linkedRecords || !newRecord) return;

                  course.setLinkedRecords(
                    [...linkedRecords, newRecord],
                    "mediaRecords"
                  );
                },
                onError: setError,
                onCompleted() {
                  setFileUploadStates((x) => ({
                    ...x,
                    [record.createMediaRecord.id]: "done",
                  }));
                  if (props.mode === "multiple") {
                    props.setSelectedRecords((x) => [
                      ...x,
                      record.createMediaRecord,
                    ]);
                  } else {
                    props.onSelect(record.createMediaRecord);
                  }
                },
              });
            })
            .catch(() =>
              setFileUploadStates((x) => ({
                ...x,
                [record.createMediaRecord.id]: "failed",
              }))
            );
        },
        updater(store, data) {
          const user = store.get(userId);
          const linkedRecords = user?.getLinkedRecords("mediaRecords");
          const newRecord = store.get(data.createMediaRecord.id);

          if (!user || !linkedRecords || !newRecord) return;

          user.setLinkedRecords(
            [...(linkedRecords ?? []), newRecord!],
            "mediaRecords"
          );
        },
      });
    },
    [createMediaRecord, props]
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

  const filteredMedia: MediaRecord[] = courseMediaRecords.filter(
    (x) => !search || x.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMediaUser: MediaRecord[] = recordsNotInCourse.filter(
    (x) => !search || x.name.toLowerCase().includes(search.toLowerCase())
  );

  const [setCourseRecords] =
    useMutation<MediaRecordSelectorAddToCourseMutation>(graphql`
      mutation MediaRecordSelectorAddToCourseMutation(
        $courseId: UUID!
        $mediaRecordIds: [UUID!]!
      ) {
        setMediaRecordsForCourse(
          courseId: $courseId
          mediaRecordIds: $mediaRecordIds
        ) {
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

  function MediaRecord({ record }: { record: MediaRecord }) {
    const checked =
      props.mode === "multiple" &&
      props.selectedRecords.find((x) => x.id === record.id);
    const toggle = () =>
      props.mode === "multiple"
        ? props.setSelectedRecords(
            checked
              ? props.selectedRecords.filter((x) => x.id !== record.id)
              : [...props.selectedRecords, record]
          )
        : props.onSelect(record);

    return (
      <ListItem
        key={record.id}
        secondaryAction={
          <div className="mr-2">
            {props.mode === "multiple" && (
              <Checkbox size="small" checked={!!checked} onClick={toggle} />
            )}
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
                    const course = store.get(coursesByIds[0].id);
                    const linkedRecords =
                      course?.getLinkedRecords("mediaRecords");

                    if (!course || !linkedRecords) return;

                    course.setLinkedRecords(
                      linkedRecords?.filter((x) => x.getDataID() !== record.id),
                      "mediaRecords"
                    );

                    const user = store.get(userId);
                    const linkedRecords2 =
                      user?.getLinkedRecords("mediaRecords");

                    if (!user || !linkedRecords2) return;

                    user.setLinkedRecords(
                      linkedRecords2?.filter(
                        (x) => x.getDataID() !== record.id
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
  }

  function MediaRecordAddToCourse({ record }: { record: MediaRecord }) {
    return (
      <ListItem
        key={record.id}
        secondaryAction={
          <div className="mr-2">
            <Button
              onClick={() => {
                setCourseRecords({
                  variables: {
                    courseId: coursesByIds[0].id,
                    mediaRecordIds: [...courseMediaRecordIds, record.id],
                  },
                  updater(store, data) {
                    const course = store.get(coursesByIds[0].id);
                    const linkedRecords =
                      course?.getLinkedRecords("mediaRecords");
                    const newRecord = store.get(record.id);

                    if (!course || !linkedRecords || !newRecord) return;

                    course.setLinkedRecords(
                      [...linkedRecords, newRecord],
                      "mediaRecords"
                    );
                  },
                  onError: setError,
                });
              }}
              aria-label="delete"
              startIcon={<Add></Add>}
            >
              Add to course
            </Button>

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
                    const user = store.get(userId);
                    const linkedRecords =
                      user?.getLinkedRecords("mediaRecords");

                    if (!user || !linkedRecords) return;

                    user.setLinkedRecords(
                      linkedRecords?.filter((x) => x.getDataID() !== record.id),
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
        <ListItemButton>
          <ListItemIcon>
            <MediaRecordIcon type={record.type} />
          </ListItemIcon>
          <ListItemText primary={record.name} />
        </ListItemButton>
      </ListItem>
    );
  }

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
            {filteredMedia.map((record) => (
              <MediaRecord record={record} key={record.id}></MediaRecord>
            ))}

            {filteredMediaUser.length > 0 && (
              <>
                <ListSubheader>Media from other courses</ListSubheader>

                {filteredMediaUser.map((record) => (
                  <MediaRecordAddToCourse record={record} key={record.id} />
                ))}
              </>
            )}
          </List>
          {files.length > 0 && (
            <MediaRecordTypeSelector
              open
              file={files[0]}
              onClose={() => setFiles(([_, ...files]) => files)}
              onSelect={onTypeSelect}
            />
          )}
        </DialogContent>
        {props.mode === "multiple" && (
          <DialogActions>
            <Button onClick={onClose}>Ok</Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
