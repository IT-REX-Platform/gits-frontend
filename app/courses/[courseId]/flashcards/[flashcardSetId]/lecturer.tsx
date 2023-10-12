import { lecturerAddFlashcardMutation } from "@/__generated__/lecturerAddFlashcardMutation.graphql";
import { lecturerDeleteFlashcardContentMutation } from "@/__generated__/lecturerDeleteFlashcardContentMutation.graphql";
import { lecturerDeleteFlashcardMutation } from "@/__generated__/lecturerDeleteFlashcardMutation.graphql";
import { lecturerEditFlashcardSetMutation } from "@/__generated__/lecturerEditFlashcardSetMutation.graphql";
import { lecturerEditFlashcardsQuery } from "@/__generated__/lecturerEditFlashcardsQuery.graphql";
import { AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { ContentTags } from "@/components/ContentTags";
import { EditFlashcardSetModal } from "@/components/EditFlashcardSetModal";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { FlashcardSideData } from "@/components/flashcard/FlashcardSide";
import { Flashcard } from "@/components/flashcard/LecturerEditFlashcard";
import { LocalFlashcard } from "@/components/flashcard/LocalFlashcard";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Alert, Backdrop, Button, CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

export default function LecturerFlashcards() {
  const { flashcardSetId, courseId } = useParams();
  const [del, deleting] =
    useMutation<lecturerDeleteFlashcardContentMutation>(graphql`
      mutation lecturerDeleteFlashcardContentMutation($id: UUID!) {
        mutateContent(contentId: $id) {
          deleteContent
        }
      }
    `);

  const router = useRouter();

  const { contentsByIds } = useLazyLoadQuery<lecturerEditFlashcardsQuery>(
    graphql`
      query lecturerEditFlashcardsQuery($id: UUID!) {
        contentsByIds(ids: [$id]) {
          id
          metadata {
            name
            chapterId #
            ...ContentTags
          }

          ... on FlashcardSetAssessment {
            flashcardSet {
              __id
              flashcards {
                id
                ...LecturerEditFlashcardFragment
              }
            }
          }
          ...EditFlashcardSetModalFragment
        }
      }
    `,
    { id: flashcardSetId }
  );

  const [isAddFlashcardOpen, setAddFlashcardOpen] = useState(false);
  const [isEditSetOpen, setEditSetOpen] = useState(false);

  const [error, setError] = useState<any>(null);
  const [addFlashcard, isAddingFlashcard] =
    useMutation<lecturerAddFlashcardMutation>(graphql`
      mutation lecturerAddFlashcardMutation(
        $flashcard: CreateFlashcardInput!
        $assessmentId: UUID!
      ) {
        mutateFlashcardSet(assessmentId: $assessmentId) {
          createFlashcard(input: $flashcard) {
            __id
            id
            ...LecturerEditFlashcardFragment
          }
        }
      }
    `);
  const [updateFlashcardSet, isUpdatingFlashcardSet] =
    useMutation<lecturerEditFlashcardSetMutation>(graphql`
      mutation lecturerEditFlashcardSetMutation(
        $assessment: UpdateAssessmentInput!
        $contentId: UUID!
      ) {
        mutateContent(contentId: $contentId) {
          updateAssessment(input: $assessment) {
            id
            metadata {
              chapterId
              rewardPoints
              tagNames
              suggestedDate
            }

            assessmentMetadata {
              initialLearningInterval
              skillPoints
              skillTypes
            }
          }
        }
      }
    `);

  const [deleteFlashcard, isDeleting] =
    useMutation<lecturerDeleteFlashcardMutation>(graphql`
      mutation lecturerDeleteFlashcardMutation(
        $flashcardId: UUID!
        $assessmentId: UUID!
      ) {
        mutateFlashcardSet(assessmentId: $assessmentId) {
          deleteFlashcard(id: $flashcardId)
        }
      }
    `);
  const isUpdating = isAddingFlashcard || isUpdatingFlashcardSet || isDeleting;

  if (contentsByIds.length == 0) {
    return <PageError message="No flashcards found with given id." />;
  }

  const content = contentsByIds[0];
  const flashcardSet = content.flashcardSet;

  if (flashcardSet == null) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content is not of type flashcards."
      />
    );
  }

  function handleAddFlashcard(sides: FlashcardSideData[]) {
    const newFlashcard = {
      sides,
    };

    setAddFlashcardOpen(false);
    addFlashcard({
      variables: { assessmentId: flashcardSetId, flashcard: newFlashcard },
      onError: setError,
      updater(store, response) {
        // Get record of flashcard set and of the new flashcard
        const flashcardSetRecord = store.get(flashcardSet!.__id);
        const newRecord = store.get(
          response.mutateFlashcardSet.createFlashcard!.__id
        );
        if (!flashcardSetRecord || !newRecord) return;

        // Update the linked records of the flashcard set
        const flashcardRecords =
          flashcardSetRecord.getLinkedRecords("flashcards") ?? [];
        flashcardSetRecord.setLinkedRecords(
          [...flashcardRecords, newRecord],
          "flashcards"
        );
      },
    });
  }

  function handleDeleteFlashcard(flashcardId: string) {
    deleteFlashcard({
      variables: {
        flashcardId: flashcardId,
        assessmentId: flashcardSetId,
      },
      onError: setError,
      updater(store) {
        // Get record of flashcard set
        const flashcardSetRecord = store.get(flashcardSet!.__id);
        if (!flashcardSetRecord) return;

        // Update the linked records of the flashcard set
        const flashcardRecords =
          flashcardSetRecord.getLinkedRecords("flashcards") ?? [];
        flashcardSetRecord.setLinkedRecords(
          flashcardRecords.filter((x) => x.getDataID() !== flashcardId),
          "flashcards"
        );
      },
    });
  }

  function handleUpdateFlashcardSet(
    metadata: ContentMetadataPayload,
    assessmentMetadata: AssessmentMetadataPayload
  ) {
    setEditSetOpen(false);
    updateFlashcardSet({
      variables: {
        assessment: {
          metadata: {
            ...metadata,
            chapterId: content.metadata.chapterId,
          },
          assessmentMetadata,
        },
        contentId: content.id,
      },
      onError: setError,
    });
  }

  return (
    <main>
      <Heading
        title={content.metadata.name}
        action={
          <div className="flex gap-2">
            <Button
              sx={{ color: "text.secondary" }}
              startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
              onClick={() => {
                if (
                  confirm(
                    "Do you really want to delete this flashcard set? This can't be undone."
                  )
                ) {
                  del({
                    variables: { id: content.id },
                    onCompleted() {
                      router.push(`/courses/${courseId}`);
                    },
                    onError(error) {
                      setError(error);
                    },
                    updater(store) {
                      store.get(content.id)?.invalidateRecord();
                    },
                  });
                }
              }}
            >
              Delete
            </Button>

            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={() => setEditSetOpen(true)}
            >
              Edit
            </Button>
          </div>
        }
        backButton
      />

      <ContentTags metadata={content.metadata} />
      {error && (
        <div className="flex flex-col gap-2 mt-8">
          {error?.source?.errors.map((err: any, i: number) => (
            <Alert key={i} severity="error" onClose={() => setError(null)}>
              {err.message}
            </Alert>
          ))}
        </div>
      )}
      <div className="mt-8 flex flex-col gap-6">
        {flashcardSet.flashcards.map((flashcard, i) => (
          <div key={i}>
            <Flashcard
              key={flashcard.id}
              title={`Card ${i + 1}/${flashcardSet.flashcards.length}`}
              onError={setError}
              _flashcard={flashcard}
              _assessmentId={flashcardSetId}
            />
            <Button
              sx={{ float: "left", color: "red" }}
              startIcon={<Delete />}
              onClick={() => {
                handleDeleteFlashcard(flashcard.id);
              }}
            >
              Delete Flashcard
            </Button>
          </div>
        ))}
        {isAddFlashcardOpen && (
          <LocalFlashcard
            onClose={() => setAddFlashcardOpen(false)}
            onSubmit={handleAddFlashcard}
          />
        )}
        <div>
          {!isAddFlashcardOpen && (
            <Button
              startIcon={<Add />}
              onClick={() => setAddFlashcardOpen(true)}
            >
              Add flashcard
            </Button>
          )}
        </div>
      </div>
      <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
      {isEditSetOpen && (
        <EditFlashcardSetModal
          onClose={() => setEditSetOpen(false)}
          onSubmit={handleUpdateFlashcardSet}
          _content={content}
        />
      )}
    </main>
  );
}
