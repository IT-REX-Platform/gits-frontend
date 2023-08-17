import { lecturerAddQuizQuestionMutation } from "@/__generated__/lecturerAddQuizQuestionMutation.graphql";
import { lecturerDeleteQuizContentMutation } from "@/__generated__/lecturerDeleteQuizContentMutation.graphql";
import { lecturerEditQuizQuery } from "@/__generated__/lecturerEditQuizQuery.graphql";
import { AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { Heading } from "@/components/Heading";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Alert, Backdrop, Button, CircularProgress } from "@mui/material";
import Error from "next/error";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { EditFlashcardSetModal } from "../../../../../components/EditFlashcardSetModal";

export default function EditQuiz() {
  const { quizId, courseId } = useParams();
  const [del, deleting] =
    useMutation<lecturerDeleteQuizContentMutation>(graphql`
      mutation lecturerDeleteQuizContentMutation($id: UUID!) {
        deleteContent(id: $id)
      }
    `);

  const router = useRouter();

  const { contentsByIds } = useLazyLoadQuery<lecturerEditQuizQuery>(
    graphql`
      query lecturerEditQuizQuery($id: UUID!) {
        contentsByIds(ids: [$id]) {
          id
          metadata {
            name
            chapterId
          }
          ... on QuizAssessment {
            quiz {
              questionPool {
                id
                ... on MultipleChoiceQuestion {
                  text
                  hint
                  answers {
                    correct
                    feedback
                    text
                  }
                }
              }
            }
          }
          ...EditFlashcardSetModalFragment
        }
      }
    `,
    { id: quizId }
  );

  const [isAddFlashcardOpen, setAddFlashcardOpen] = useState(false);
  const [isEditSetOpen, setEditSetOpen] = useState(false);

  const [error, setError] = useState<any>(null);
  const [addFlashcard, isAddingFlashcard] =
    useMutation<lecturerAddQuizQuestionMutation>(graphql`
      mutation lecturerAddQuizQuestionMutation(
        $flashcard: CreateFlashcardInput!
        $assessmentId: UUID!
      ) {
        mutateQuiz(assessmentId: $assessmentId) {
          addMultipleChoiceQuestion(input: $quiz) {
            questionPool {
              
            }
          }
          
        }
      }
    `);
  const [updateFlashcardSet, isUpdatingFlashcardSet] = useMutation(graphql`
    mutation lecturerEditFlashcardSetMutation(
      $assessment: UpdateAssessmentInput!
    ) {
      updateAssessment(input: $assessment) {
        id
      }
    }
  `);
  const isUpdating = isAddingFlashcard || isUpdatingFlashcardSet;

  if (contentsByIds.length == 0) {
    return <Error statusCode={404} />;
  }

  const content = contentsByIds[0];
  const flashcardSet = content.flashcardSet;

  if (flashcardSet == null) {
    return <Error statusCode={400} />;
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

  function handleUpdateFlashcardSet(
    metadata: ContentMetadataPayload,
    assessmentMetadata: AssessmentMetadataPayload
  ) {
    const assessment = {
      id: content.id,
      metadata: {
        ...metadata,
        chapterId: content.metadata.chapterId,
      },
      assessmentMetadata,
    };

    setEditSetOpen(false);
    updateFlashcardSet({
      variables: { assessment },
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
                      const chapter = store.get(content.metadata.chapterId);
                      const contents = chapter?.getLinkedRecords("contents");
                      if (chapter && contents) {
                        chapter.setLinkedRecords(
                          contents.filter((x) => x.getDataID() !== content.id),
                          "contents"
                        );
                      }
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
          <Flashcard
            key={flashcard.id}
            title={`Card ${i + 1}/${flashcardSet.flashcards.length}`}
            onError={setError}
            _flashcard={flashcard}
            _assessmentId={flashcardSetId}
          />
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
