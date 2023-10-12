"use client";
import { EditContentModalFragment$key } from "@/__generated__/EditContentModalFragment.graphql";
import { EditContentModalUpdateStageMutation } from "@/__generated__/EditContentModalUpdateStageMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { AddFlashcardSetModal } from "@/components/AddFlashcardSetModal";
import { Add, Edit, EditNote } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { MediaContentModal } from "./MediaContentModal";
import { QuizModal } from "./QuizModal";

export function EditContentModal({
  chapterId,
  stageId,
  sectionId,
  _chapter,
  _mediaRecords,
  optionalRecords: _optionalRecords,
  requiredRecords: _requiredRecords,
  courseId,
}: {
  chapterId: string;
  sectionId: string;
  stageId: string;
  _mediaRecords: MediaRecordSelector$key;
  _chapter: EditContentModalFragment$key;

  optionalRecords: string[];
  requiredRecords: string[];
  courseId: string;
}) {
  const [openMediaModal, setOpenMediaModal] = useState(false);
  const [openFlashcardModal, setOpenFlashcardModal] = useState(false);
  const [openAddQuizModal, setOpenAddQuizModal] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const chapter = useFragment(
    graphql`
      fragment EditContentModalFragment on Chapter {
        ...AddFlashcardSetModalFragment
        sections {
          stages {
            id
            optionalContents {
              id
            }
            requiredContents {
              id
            }
          }
        }
        contents {
          id
          metadata {
            name
          }
          ... on FlashcardSetAssessment {
            __typename
          }
          ... on MediaContent {
            __typename
          }
          ... on QuizAssessment {
            __typename
          }
        }
        contentsWithNoSection {
          id
        }
      }
    `,
    _chapter
  );

  const [optionalRecords, setOptionalRecords] = useState(_optionalRecords);
  const [requiredRecords, setRequiredRecords] = useState(_requiredRecords);

  const [updateStage, loading] =
    useMutation<EditContentModalUpdateStageMutation>(graphql`
      mutation EditContentModalUpdateStageMutation(
        $stage: UpdateStageInput!
        $sectionId: UUID!
      ) {
        mutateSection(sectionId: $sectionId) {
          updateStage(input: $stage) {
            id
            ...LecturerSectionStageFragment
          }
        }
      }
    `);

  useEffect(() => {
    setOptionalRecords(_optionalRecords);
  }, [_optionalRecords]);

  useEffect(() => {
    setRequiredRecords(_requiredRecords);
  }, [_requiredRecords]);

  const router = useRouter();

  const [error, setError] = useState<any>(null);

  const submit = () => {
    updateStage({
      variables: {
        sectionId,
        stage: {
          id: stageId,
          requiredContents: requiredRecords,
          optionalContents: optionalRecords,
        },
      },
      onError: setError,
      onCompleted() {
        setOpenModal(false);
      },
      updater(store) {
        const root = store.get(chapterId);
        if (!root) return;

        const prevOther = chapter.contentsWithNoSection.map((x) => x.id);
        const prevSelected = [..._optionalRecords, ..._requiredRecords];
        const newSelected = [...optionalRecords, ...requiredRecords];

        const toAdd = prevSelected.filter((x) => !newSelected.includes(x));
        const toRemove = prevOther.filter((x) => newSelected.includes(x));

        const contents = root?.getLinkedRecords("contentsWithNoSection") ?? [];
        const newContents = [
          ...contents.filter((x) => !toRemove.includes(x.getDataID())),
          ...toAdd.map((x) => store.get(x)!),
        ];

        root.setLinkedRecords(newContents, "contentsWithNoSection");
      },
    });
  };

  return (
    <>
      <Button startIcon={<EditNote />} onClick={() => setOpenModal(true)}>
        Edit content
      </Button>

      <Dialog
        maxWidth="lg"
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <DialogTitle>Select content</DialogTitle>
        <DialogContent sx={{ paddingX: 0 }}>
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

          <List className="min-w-[500px]">
            {chapter.contents.map((content) => {
              const optional = optionalRecords.find((x) => x === content.id);
              const required = requiredRecords.find((x) => x === content.id);

              const partOfOtherStage = chapter.sections
                .flatMap((s) => s.stages)
                .filter((s) => s.id !== stageId)
                .some(
                  (s) =>
                    s.optionalContents.some((c) => c.id === content.id) ||
                    s.requiredContents.some((c) => c.id === content.id)
                );

              const toggle =
                optional || required
                  ? () => {
                      setOptionalRecords(
                        optionalRecords.filter((x) => x !== content.id)
                      );
                      setRequiredRecords(
                        requiredRecords.filter((x) => x !== content.id)
                      );
                    }
                  : () => {
                      setRequiredRecords([...requiredRecords, content.id]);
                    };

              const checked = optional || required;

              const toggleOptional = optional
                ? () => {
                    setOptionalRecords(
                      optionalRecords.filter((x) => x !== content.id)
                    );
                    setRequiredRecords([...requiredRecords, content.id]);
                  }
                : () => {
                    setOptionalRecords([...optionalRecords, content.id]);
                    setRequiredRecords(
                      requiredRecords.filter((x) => x !== content.id)
                    );
                  };

              return (
                <ListItem
                  key={content.id}
                  secondaryAction={
                    <div className="mr-2 flex gap-x-3">
                      {checked && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!required}
                              onClick={toggleOptional}
                            />
                          }
                          label={required ? "Required" : "Optional"}
                        />
                      )}

                      <IconButton
                        edge="end"
                        onClick={() =>
                          router.push(
                            content.__typename === "FlashcardSetAssessment"
                              ? `/courses/${courseId}/flashcards/${content.id}`
                              : content.__typename === "MediaContent"
                              ? `/courses/${courseId}/media/${content.id}`
                              : content.__typename === "QuizAssessment"
                              ? `/courses/${courseId}/quiz/${content.id}`
                              : ""
                          )
                        }
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </div>
                  }
                  disablePadding
                >
                  <ListItemButton
                    onClick={toggle}
                    disabled={partOfOtherStage}
                    className="!pl-6"
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={!!checked}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>

                    <ListItemText
                      primary={content.metadata.name}
                      secondary={
                        partOfOtherStage ? "Already part of another stage" : ""
                      }
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>

        <DialogContent>
          {/* add flashcard button */}
          <Button
            onClick={() => setOpenFlashcardModal(true)}
            variant="text"
            className="mt-4"
            startIcon={<Add />}
          >
            Add Flashcards
          </Button>
          <Button
            onClick={() => setOpenMediaModal(true)}
            variant="text"
            className="mt-4"
            startIcon={<Add />}
          >
            Add Media
          </Button>
          <Button
            onClick={() => setOpenAddQuizModal(true)}
            variant="text"
            className="mt-4"
            startIcon={<Add />}
          >
            Add Quiz
          </Button>
        </DialogContent>
        <DialogActions>
          <LoadingButton loading={loading} onClick={submit}>
            Ok
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <MediaContentModal
        chapterId={chapterId}
        isOpen={openMediaModal}
        onClose={() => setOpenMediaModal(false)}
        _mediaRecords={_mediaRecords}
      />
      <QuizModal
        isOpen={openAddQuizModal}
        onClose={() => setOpenAddQuizModal(false)}
        chapterId={chapterId}
        _existingQuiz={null}
      />
      {openFlashcardModal && (
        <AddFlashcardSetModal
          onClose={() => setOpenFlashcardModal(false)}
          _chapter={chapter}
        />
      )}
    </>
  );
}
