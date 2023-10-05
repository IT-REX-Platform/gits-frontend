"use client";

import { studentFlashcardLogProgressMutation } from "@/__generated__/studentFlashcardLogProgressMutation.graphql";
import { studentFlashcardsQuery } from "@/__generated__/studentFlashcardsQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { FormErrors } from "@/components/FormErrors";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { StudentFlashcard } from "@/components/StudentFlashcard";
import { Button, CircularProgress } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

export default function StudentFlashcards() {
  // Get course id from url
  const { flashcardSetId, courseId } = useParams();
  const router = useRouter();

  // Fetch course data
  const { findContentsByIds } = useLazyLoadQuery<studentFlashcardsQuery>(
    graphql`
      query studentFlashcardsQuery($id: [UUID!]!) {
        findContentsByIds(ids: $id) {
          id
          metadata {
            name
            ...ContentTags
          }
          ... on FlashcardSetAssessment {
            flashcardSet {
              flashcards {
                id
                ...StudentFlashcard
              }
            }
          }
        }
      }
    `,
    { id: [flashcardSetId] }
  );

  const [setFlashcardLearned, logging] =
    useMutation<studentFlashcardLogProgressMutation>(graphql`
      mutation studentFlashcardLogProgressMutation(
        $input: LogFlashcardLearnedInput!
      ) {
        logFlashcardLearned(input: $input) {
          success
        }
      }
    `);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [knew, setKnew] = useState(false);
  const [error, setError] = useState<any>(null);

  const flashcards = findContentsByIds[0];

  if (!flashcards) {
    return <PageError message="No flashcards found with given id." />;
  }
  if (
    !flashcards.flashcardSet ||
    flashcards.flashcardSet.flashcards.length === 0
  ) {
    return (
      <PageError
        title={flashcards.metadata.name}
        message="Empty flashcard set."
      />
    );
  }

  const currentFlashcard = flashcards.flashcardSet.flashcards[currentIndex];

  const nextCard = async () => {
    setFlashcardLearned({
      variables: {
        input: {
          flashcardId: currentFlashcard.id,
          successful: knew,
        },
      },
      onCompleted() {
        if (
          currentIndex + 1 <
          (flashcards.flashcardSet?.flashcards.length ?? 0)
        ) {
          setCurrentIndex(currentIndex + 1);
          setKnew(false);
        } else {
          router.push(`/courses/${courseId}`);
        }
      },
      onError(error) {
        setError(error);
      },
    });
  };

  return (
    <main>
      <Heading title={flashcards.metadata.name} backButton />
      <ContentTags metadata={flashcards.metadata} />
      <FormErrors error={error} onClose={() => setError(null)} />

      <StudentFlashcard
        _flashcard={currentFlashcard}
        label={`${currentIndex + 1}/${
          flashcards.flashcardSet.flashcards.length
        }`}
        onChange={(correctness) => setKnew(correctness === 1)}
      />

      <div className="mt-6 w-full flex justify-center">
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={nextCard}
          className="mb-6"
        >
          {logging ? (
            <CircularProgress size={16}></CircularProgress>
          ) : currentIndex + 1 <
            (flashcards.flashcardSet?.flashcards.length ?? 0) ? (
            "Next"
          ) : (
            "Finish"
          )}
        </Button>
      </div>
    </main>
  );
}
