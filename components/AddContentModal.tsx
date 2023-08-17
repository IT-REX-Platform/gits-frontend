"use client";
import { AddContentModalFragment$key } from "@/__generated__/AddContentModalFragment.graphql";
import { AddContentModalUpdateStageMutation } from "@/__generated__/AddContentModalUpdateStageMutation.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { AddFlashcardSetModal } from "@/components/AddFlashcardSetModal";
import { Add, ArrowForward } from "@mui/icons-material";
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
import { AddQuizModal } from "./AddQuizModal";
import { MediaContentModal } from "./MediaContentModal";

export function AddContentModal({
  chapterId,
  stageId,
  _chapter,
  _mediaRecords,
  optionalRecords: _optionalRecords,
  requiredRecords: _requiredRecords,
}: {
  chapterId: string;
  stageId: string;
  _mediaRecords: MediaRecordSelector$key;
  _chapter: AddContentModalFragment$key;

  optionalRecords: string[];
  requiredRecords: string[];
}) {
  const [openMediaModal, setOpenMediaModal] = useState(false);
  const [openFlashcardModal, setOpenFlashcardModal] = useState(false);
  const [openAddQuizModal, setOpenAddQuizModal] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const chapter = useFragment(
    graphql`
      fragment AddContentModalFragment on Chapter {
        ...AddFlashcardSetModalFragment
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
      }
    `,
    _chapter
  );

  const [optionalRecords, setOptionalRecords] = useState(_optionalRecords);
  const [requiredRecords, setRequiredRecords] = useState(_requiredRecords);

  const [updateStage] = useMutation<AddContentModalUpdateStageMutation>(graphql`
    mutation AddContentModalUpdateStageMutation($stage: UpdateStageInput!) {
      updateStage(input: $stage) {
        id
        ...lecturerStageFragment
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
        stage: {
          id: stageId,
          requiredContents: optionalRecords,
          optionalContents: requiredRecords,
        },
      },
      onError: setError,
      onCompleted() {
        setOpenModal(false);
      },
    });
  };

  return (
    <>
      <Button startIcon={<Add />} onClick={() => setOpenModal(true)}>
        Add media
      </Button>

      <Dialog
        maxWidth="lg"
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <DialogTitle>Select media</DialogTitle>
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
                              ? `flashcards/${content.id}`
                              : content.__typename === "MediaContent"
                              ? `media/${content.id}`
                              : content.__typename === "QuizAssessment"
                              ? `quizzes/${content.id}`
                              : ""
                          )
                        }
                      >
                        <ArrowForward />
                      </IconButton>
                    </div>
                  }
                  disablePadding
                >
                  <ListItemButton onClick={toggle}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={!!checked}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>

                    <ListItemText primary={content.metadata.name} />
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
          <Button onClick={submit}>Ok</Button>
        </DialogActions>
      </Dialog>

      <MediaContentModal
        chapterId={chapterId}
        isOpen={openMediaModal}
        onClose={() => setOpenMediaModal(false)}
        _mediaRecords={_mediaRecords}
      />
      <AddQuizModal
        isOpen={openAddQuizModal}
        onClose={() => setOpenAddQuizModal(false)}
        chapterId={chapterId}
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
