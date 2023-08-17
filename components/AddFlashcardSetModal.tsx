import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

import {
  AddFlashcardSetModalAssessmentMutation,
  ContentType,
  SkillType,
} from "@/__generated__/AddFlashcardSetModalAssessmentMutation.graphql";
import { AddFlashcardSetModalFragment$key } from "@/__generated__/AddFlashcardSetModalFragment.graphql";
import { AddFlashcardSetModalMutation } from "@/__generated__/AddFlashcardSetModalMutation.graphql";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "./AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "./ContentMetadataFormSection";
import { Form } from "./Form";

export function AddFlashcardSetModal({
  onClose,
  _chapter,
}: {
  onClose: () => void;
  _chapter: AddFlashcardSetModalFragment$key;
}) {
  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(null);
  const [error, setError] = useState<any>(null);
  const valid = metadata != null && assessmentMetadata != null;

  const chapter = useFragment(
    graphql`
      fragment AddFlashcardSetModalFragment on Chapter {
        id
        __id
      }
    `,
    _chapter
  );

  const [createAssessment, isCreatingAssessment] =
    useMutation<AddFlashcardSetModalAssessmentMutation>(graphql`
      mutation AddFlashcardSetModalAssessmentMutation(
        $assessment: CreateAssessmentInput!
      ) {
        createAssessment(input: $assessment) {
          __id
          __typename

          ...ContentFlashcardFragment

          id
          userProgressData {
            nextLearnDate
          }
        }
      }
    `);
  const [createFlashcardSet, isCreatingFlashcardSet] =
    useMutation<AddFlashcardSetModalMutation>(graphql`
      mutation AddFlashcardSetModalMutation($assessmentId: UUID!) {
        createFlashcardSet(
          input: { assessmentId: $assessmentId, flashcards: [] }
        ) {
          assessmentId
        }
      }
    `);
  const isUpdating = isCreatingAssessment || isCreatingFlashcardSet;

  function handleSubmit() {
    const assessment = {
      metadata: {
        ...metadata!,
        chapterId: chapter.id,
        tagNames: [],
        type: "FLASHCARDS" as ContentType,
      },
      assessmentMetadata: {
        ...assessmentMetadata!,
        skillType: assessmentMetadata!.skillType as SkillType,
      },
    };
    createAssessment({
      variables: { assessment },
      onError: setError,
      onCompleted(response) {
        createFlashcardSet({
          variables: {
            assessmentId: response.createAssessment.id,
          },
          onError: setError,
          updater(store) {
            // Get record of chapter and of the new assignment
            const chapterRecord = store.get(chapter.__id);
            const newRecord = store.get(response!.createAssessment.__id);
            if (!chapterRecord || !newRecord) return;

            // Update the linked records of the chapter contents
            const contentRecords =
              chapterRecord.getLinkedRecords("contents") ?? [];
            chapterRecord.setLinkedRecords(
              [...contentRecords, newRecord],
              "contents"
            );
          },
          onCompleted() {
            onClose();
          },
        });
      },
    });
    onClose();
  }

  return (
    <>
      <Dialog maxWidth="md" open onClose={onClose}>
        <DialogTitle>Add flashcard set</DialogTitle>
        <DialogContent>
          {error?.source.errors.map((err: any, i: number) => (
            <Alert key={i} severity="error" onClose={() => setError(null)}>
              {err.message}
            </Alert>
          ))}
          <Form>
            <ContentMetadataFormSection onChange={setMetadata} />
            <AssessmentMetadataFormSection onChange={setAssessmentMetadata} />
          </Form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
    </>
  );
}
