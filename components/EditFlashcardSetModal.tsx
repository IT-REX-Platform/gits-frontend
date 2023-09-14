import { EditFlashcardSetModalFragment$key } from "@/__generated__/EditFlashcardSetModalFragment.graphql";
import {
  AssessmentMetadataFormSection,
  AssessmentMetadataPayload,
} from "@/components/AssessmentMetadataFormSection";
import {
  ContentMetadataFormSection,
  ContentMetadataPayload,
} from "@/components/ContentMetadataFormSection";
import { Form } from "@/components/Form";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";

export function EditFlashcardSetModal({
  onClose,
  onSubmit,
  _content,
}: {
  onClose: () => void;
  onSubmit: (
    metadata: ContentMetadataPayload,
    assessmentMetadata: AssessmentMetadataPayload
  ) => void;
  _content: EditFlashcardSetModalFragment$key;
}) {
  const content = useFragment(
    graphql`
      fragment EditFlashcardSetModalFragment on Content {
        id
        metadata {
          name
          suggestedDate
          rewardPoints
          tagNames
        }
        ... on Assessment {
          assessmentMetadata {
            skillTypes
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
