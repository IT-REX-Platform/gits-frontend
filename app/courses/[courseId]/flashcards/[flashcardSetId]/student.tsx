"use client";

import { studentFlashcardsQuery } from "@/__generated__/studentFlashcardsQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { FormErrors } from "@/components/FormErrors";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { StudentFlashcardSet } from "@/components/StudentFlashcardSet";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function StudentFlashcards() {
  // Get course id from url
  const { flashcardSetId, courseId } = useParams();
  const router = useRouter();
  const [error, setError] = useState<any>(null);

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

  const flashcards = findContentsByIds[0];
  if (!flashcards) {
    return <PageError message="No flashcards found with given id." />;
  }
  if (!flashcards.flashcardSet) {
    return (
      <PageError
        title={flashcards.metadata.name}
        message="Content is not of type flashcards."
      />
    );
  }

  return (
    <main className="flex flex-col h-full">
      <Heading title={flashcards.metadata.name} backButton />
      <ContentTags metadata={flashcards.metadata} />
      <FormErrors error={error} onClose={() => setError(null)} />

      <StudentFlashcardSet
        flashcards={flashcards.flashcardSet.flashcards.map((x) => ({
          id: x.id,
          _flashcard: x,
        }))}
        emptyMessage="Empty flashcard set."
        onComplete={() => router.push(`/courses/${courseId}`)}
        onError={setError}
      />
    </main>
  );
}
