import { lecturerAddFlashcardMutation } from "@/__generated__/lecturerAddFlashcardMutation.graphql";
import { lecturerDeleteFlashcardContentMutation } from "@/__generated__/lecturerDeleteFlashcardContentMutation.graphql";
import { lecturerDeleteFlashcardMutation } from "@/__generated__/lecturerDeleteFlashcardMutation.graphql";
import { lecturerEditFlashcardFragment$key } from "@/__generated__/lecturerEditFlashcardFragment.graphql";
import { lecturerEditFlashcardMutation } from "@/__generated__/lecturerEditFlashcardMutation.graphql";
import { lecturerEditFlashcardSetMutation } from "@/__generated__/lecturerEditFlashcardSetMutation.graphql";
import { lecturerEditFlashcardsQuery } from "@/__generated__/lecturerEditFlashcardsQuery.graphql";
import { AssessmentMetadataPayload } from "@/components/AssessmentMetadataFormSection";
import { ContentMetadataPayload } from "@/components/ContentMetadataFormSection";
import { ContentTags } from "@/components/ContentTags";
import { Form, FormSection } from "@/components/Form";
import { Heading } from "@/components/Heading";
import { Add, Delete, Edit, Help, QuestionAnswer } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Alert,
  Backdrop,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";
import { EditFlashcardSetModal } from "../../../../../components/EditFlashcardSetModal";
import { isUUID } from "@/src/utils";
import { PageError } from "@/components/PageError";

export default function LecturerFlashcards() {
  const { flashcardSetId, courseId } = useParams();
  if (!isUUID(courseId)) {
    return <PageError message="Invalid course id." />;
  }
  if (!isUUID(flashcardSetId)) {
    return <PageError message="Invalid flashcards id." />;
  }
  return <_LecturerFlashcards />;
}

function _LecturerFlashcards() {
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
                ...lecturerEditFlashcardFragment
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
            ...lecturerEditFlashcardFragment
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

function Flashcard({
  title,
  onError,
  _flashcard,
  _assessmentId,
}: {
  title: string;
  onError: (error: any) => void;
  _flashcard: lecturerEditFlashcardFragment$key;
  _assessmentId: string;
}) {
  const flashcard = useFragment(
    graphql`
      fragment lecturerEditFlashcardFragment on Flashcard {
        id
        sides {
          label
          text
          isQuestion
          isAnswer
        }
      }
    `,
    _flashcard
  );

  const [addSideOpen, setAddSideOpen] = useState(false);
  const [updateFlashcard, isUpdating] =
    useMutation<lecturerEditFlashcardMutation>(graphql`
      mutation lecturerEditFlashcardMutation(
        $flashcard: UpdateFlashcardInput!
        $assessmentId: UUID!
      ) {
        mutateFlashcardSet(assessmentId: $assessmentId) {
          updateFlashcard(input: $flashcard) {
            ...lecturerEditFlashcardFragment
          }
        }
      }
    `);

  function handleEditFlashcardSide(idx: number, editedSide: FlashcardSideData) {
    const newFlashcard = {
      id: flashcard.id,
      sides: flashcard.sides.map((side, i) => {
        const { label, text, isQuestion, isAnswer } =
          i == idx ? editedSide : side;
        return { label, text, isQuestion, isAnswer };
      }),
    };

    updateFlashcard({
      variables: { assessmentId: _assessmentId, flashcard: newFlashcard },
      onError,
    });
  }

  function handleDeleteFlashcardSide(idx: number) {
    const newFlashcard = {
      id: flashcard.id,
      sides: flashcard.sides.filter((_, i) => i != idx),
    };

    updateFlashcard({
      variables: { assessmentId: _assessmentId, flashcard: newFlashcard },
      onError,
    });
  }

  function handleAddSideSubmit(newSide: FlashcardSideData) {
    const newFlashcard = {
      id: flashcard.id,
      sides: [
        ...flashcard.sides.map(({ label, text, isQuestion, isAnswer }) => ({
          label,
          text,
          isQuestion,
          isAnswer,
        })),
        newSide,
      ],
    };

    updateFlashcard({
      variables: { assessmentId: _assessmentId, flashcard: newFlashcard },
      onError,
      onCompleted() {
        setAddSideOpen(false);
      },
    });
  }

  return (
    <>
      <div>
        <Typography variant="overline" color="textSecondary">
          {title}
        </Typography>
        <div className="flex flex-wrap gap-2">
          {flashcard.sides.map((side, i) => (
            <div key={i} className="flex items-center">
              <FlashcardSide
                key={`${flashcard.id}-${i}`}
                side={side}
                onChange={(data) => handleEditFlashcardSide(i, data)}
              />
              <IconButton onClick={() => handleDeleteFlashcardSide(i)}>
                <ClearIcon />
              </IconButton>
            </div>
          ))}
        </div>
        <Button
          sx={{ marginTop: 1 }}
          startIcon={<Add />}
          onClick={() => setAddSideOpen(true)}
        >
          Add side
        </Button>
      </div>
      <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
      {addSideOpen && (
        <EditSideModal
          onClose={() => setAddSideOpen(false)}
          onSubmit={handleAddSideSubmit}
        />
      )}
    </>
  );
}

function FlashcardSide({
  side,
  onChange,
}: {
  onChange: (side: FlashcardSideData) => void;
  side: FlashcardSideData;
}) {
  const [edit, setEdit] = useState(false);

  function handleEditSubmit(data: FlashcardSideData) {
    setEdit(false);
    onChange(data);
  }

  return (
    <>
      <Card variant="outlined" className="min-w-[20rem] max-w-[30%]">
        <CardHeader
          title={side.label}
          avatar={
            side.isQuestion ? (
              <Help fontSize="large" sx={{ color: "grey.400" }} />
            ) : (
              <QuestionAnswer fontSize="large" sx={{ color: "grey.400" }} />
            )
          }
          action={
            <IconButton onClick={() => setEdit(true)}>
              <Edit fontSize="small" />
            </IconButton>
          }
          classes={{
            action: "!my-0",
          }}
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {side.text}
          </Typography>
        </CardContent>
      </Card>
      {edit && (
        <EditSideModal
          onClose={() => setEdit(false)}
          onSubmit={handleEditSubmit}
          side={side}
        />
      )}
    </>
  );
}

type FlashcardSideData = {
  label: string;
  text: string;
  isQuestion: boolean;
  isAnswer: boolean;
};

function EditSideModal({
  onClose,
  onSubmit,
  side,
}: {
  onClose: () => void;
  onSubmit: (side: FlashcardSideData) => void;
  side?: FlashcardSideData;
}) {
  const [label, setLabel] = useState(side?.label ?? "");
  // Initialize the text state with an empty object of type FlashcardSideDataMarkdown
  const [text, setText] = useState(side?.text ?? "");
  const [isQuestion, setIsQuestion] = useState(side?.isQuestion ?? false);
  const [isAnswer, setIsAnswer] = useState(side?.isAnswer ?? false);

  const valid =
    label.trim() != "" && text.trim() != "" && (isQuestion || isAnswer);

  return (
    <Dialog maxWidth="md" open onClose={onClose}>
      <DialogTitle>{side ? "Edit" : "Add"} flashcard side</DialogTitle>
      <DialogContent>
        <Form>
          <FormSection title="General">
            <TextField
              className="w-96"
              label="Label"
              variant="outlined"
              value={label}
              error={side && label.trim() == ""}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
            <TextField
              className="w-96"
              label="Text"
              variant="outlined"
              value={text} // Access the 'text' property of the 'text' state
              error={side && text.trim() == ""}
              onChange={(e) => setText(e.target.value)}
              multiline
              required
            />
            <FormControlLabel
              label="Question"
              control={
                <Checkbox
                  checked={isQuestion}
                  onChange={(e) => setIsQuestion(e.target.checked)}
                />
              }
            />
            <FormControlLabel
              label="Answer"
              control={
                <Checkbox
                  checked={isAnswer}
                  onChange={(e) => setIsAnswer(e.target.checked)}
                />
              }
            />
          </FormSection>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!valid}
          onClick={() => onSubmit({ label, text, isQuestion, isAnswer })}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LocalFlashcard({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (sides: FlashcardSideData[]) => void;
}) {
  const [sides, setSides] = useState<FlashcardSideData[]>([]);
  const [addSideOpen, setAddSideOpen] = useState(false);

  const numQuestions = sides.filter((s) => s.isQuestion === true).length;
  const numAnswers = sides.filter((s) => s.isQuestion === false).length;
  const valid = numQuestions >= 1 && numAnswers >= 1;

  function handleEditFlashcardSide(idx: number, data: FlashcardSideData) {
    setSides((sides) => sides.map((side, i) => (i == idx ? data : side)));
  }

  function handleAddSideSubmit(data: FlashcardSideData) {
    setSides((sides) => [...sides, data]);
    setAddSideOpen(false);
  }

  const saveButton = (
    <span>
      <Button
        variant="contained"
        disabled={!valid}
        onClick={() => onSubmit(sides)}
      >
        Save
      </Button>
    </span>
  );

  return (
    <div className="pt-4 pb-6 -mx-8 px-8 bg-gray-50">
      <Typography variant="overline" color="textSecondary">
        New flashcard (not saved)
      </Typography>
      <div className="flex flex-wrap gap-2">
        {sides.map((side, i) => (
          <FlashcardSide
            key={`add-flashcard-${i}`}
            side={side}
            onChange={(data) => handleEditFlashcardSide(i, data)}
          />
        ))}
      </div>
      <Button
        startIcon={<Add />}
        sx={{ marginTop: 1 }}
        onClick={() => setAddSideOpen(true)}
      >
        Add side
      </Button>
      <div className="mt-4 flex gap-2">
        {numQuestions < 1 ? (
          <Tooltip title="At least one question side is required to save">
            {saveButton}
          </Tooltip>
        ) : numAnswers < 1 ? (
          <Tooltip title="At least one answer side is required to save">
            {saveButton}
          </Tooltip>
        ) : (
          saveButton
        )}
        <Button onClick={onClose}>Cancel</Button>
      </div>
      {addSideOpen && (
        <EditSideModal
          onClose={() => setAddSideOpen(false)}
          onSubmit={handleAddSideSubmit}
        />
      )}
    </div>
  );
}
