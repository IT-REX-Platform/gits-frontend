import { lecturerAddFlashcardMutation } from "@/__generated__/lecturerAddFlashcardMutation.graphql";
import { lecturerEditFlashcardFragment$key } from "@/__generated__/lecturerEditFlashcardFragment.graphql";
import { lecturerEditFlashcardMutation } from "@/__generated__/lecturerEditFlashcardMutation.graphql";
import { lecturerEditFlashcardSetModalFragment$key } from "@/__generated__/lecturerEditFlashcardSetModalFragment.graphql";
import { lecturerEditFlashcardsQuery } from "@/__generated__/lecturerEditFlashcardsQuery.graphql";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "@/components/AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "@/components/ContentMetadataFormSection";
import { Form, FormSection } from "@/components/Form";
import { Heading } from "@/components/Heading";
import { Add, Edit, Help, QuestionAnswer } from "@mui/icons-material";
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
import Error from "next/error";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

export default function EditFlashcards() {
  const { flashcardSetId } = useParams();
  const { contentsByIds } = useLazyLoadQuery<lecturerEditFlashcardsQuery>(
    graphql`
      query lecturerEditFlashcardsQuery($id: UUID!) {
        contentsByIds(ids: [$id]) {
          id
          metadata {
            name
            chapterId
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
          ...lecturerEditFlashcardSetModalFragment
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
      mutation lecturerAddFlashcardMutation($flashcard: CreateFlashcardInput!) {
        createFlashcard(input: $flashcard) {
          __id
          id
          ...lecturerEditFlashcardFragment
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
      setId: flashcardSetId,
      sides,
    };

    setAddFlashcardOpen(false);
    addFlashcard({
      variables: { flashcard: newFlashcard },
      onError: setError,
      updater(store, response) {
        // Get record of flashcard set and of the new flashcard
        const flashcardSetRecord = store.get(flashcardSet!.__id);
        const newRecord = store.get(response.createFlashcard.__id);
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
          <Button
            sx={{ color: "text.secondary" }}
            startIcon={<Edit />}
            onClick={() => setEditSetOpen(true)}
          >
            Edit
          </Button>
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

function Flashcard({
  title,
  onError,
  _flashcard,
}: {
  title: string;
  onError: (error: any) => void;
  _flashcard: lecturerEditFlashcardFragment$key;
}) {
  const flashcard = useFragment(
    graphql`
      fragment lecturerEditFlashcardFragment on Flashcard {
        id
        sides {
          label
          text
          isQuestion
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
      ) {
        updateFlashcard(input: $flashcard) {
          ...lecturerEditFlashcardFragment
        }
      }
    `);

  function handleEditFlashcardSide(idx: number, editedSide: FlashcardSideData) {
    const newFlashcard = {
      id: flashcard.id,
      sides: flashcard.sides.map((side, i) => {
        const { label, text, isQuestion } = i == idx ? editedSide : side;
        return { label, text, isQuestion };
      }),
    };

    updateFlashcard({
      variables: { flashcard: newFlashcard },
      onError,
    });
  }

  function handleAddSideSubmit(newSide: FlashcardSideData) {
    const newFlashcard = {
      id: flashcard.id,
      sides: [
        ...flashcard.sides.map(({ label, text, isQuestion }) => ({
          label,
          text,
          isQuestion,
        })),
        newSide,
      ],
    };

    updateFlashcard({
      variables: { flashcard: newFlashcard },
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
            <FlashcardSide
              key={`${flashcard.id}-${i}`}
              side={side}
              onChange={(data) => handleEditFlashcardSide(i, data)}
            />
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

type FlashcardSideData = { label: string; text: string; isQuestion: boolean };

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
  const [text, setText] = useState(side?.text ?? "");
  const [isQuestion, setIsQuestion] = useState(side?.isQuestion ?? false);

  const valid = label.trim() != "" && text.trim() != "";

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
              value={text}
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
          </FormSection>
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!valid}
          onClick={() => onSubmit({ label, text, isQuestion })}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function EditFlashcardSetModal({
  onClose,
  onSubmit,
  _content,
}: {
  onClose: () => void;
  onSubmit: (
    metadata: ContentMetadataPayload,
    assessmentMetadata: AssessmentMetadataPayload
  ) => void;
  _content: lecturerEditFlashcardSetModalFragment$key;
}) {
  const content = useFragment(
    graphql`
      fragment lecturerEditFlashcardSetModalFragment on Content {
        metadata {
          name
          suggestedDate
          rewardPoints
        }
        ... on Assessment {
          assessmentMetadata {
            skillType
            skillPoints
          }
        }
      }
    `,
    _content
  );

  const [metadata, setMetadata] = useState<ContentMetadataPayload | null>(null);
  const [assessmentMetadata, setAssessmentMetadata] =
    useState<AssessmentMetadataPayload | null>(null);
  const valid = metadata != null && assessmentMetadata != null;

  return (
    <Dialog maxWidth="md" open onClose={onClose}>
      <DialogTitle>Edit flashcard set</DialogTitle>
      <DialogContent>
        <Form>
          <ContentMetadataFormSection
            metadata={content.metadata}
            onChange={setMetadata}
          />
          <AssessmentMetadataFormSection
            metadata={content.assessmentMetadata}
            onChange={setAssessmentMetadata}
          />
        </Form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!valid}
          onClick={() => onSubmit(metadata!, assessmentMetadata!)}
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