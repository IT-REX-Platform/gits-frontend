"use client";

import { studentDueFlashcardsQuery } from "@/__generated__/studentDueFlashcardsQuery.graphql";
import { FormErrors } from "@/components/FormErrors";
import { Heading } from "@/components/Heading";
import { StudentFlashcardSet } from "@/components/StudentFlashcardSet";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

export default function StudentDueFlashcards() {
  // Get course id from url
  const { courseId } = useParams();
  const router = useRouter();
  const [error, setError] = useState<any>(null);

  // Fetch course data
  const { dueFlashcardsByCourseId } =
    useLazyLoadQuery<studentDueFlashcardsQuery>(
      graphql`
        query studentDueFlashcardsQuery($courseId: UUID!) {
          dueFlashcardsByCourseId(courseId: $courseId) {
            id
            ...StudentFlashcard
          }
        }
      `,
      { courseId }
    );

  return (
    <main className="flex flex-col h-full">
      <Heading title="Due flashcards" backButton />
      <FormErrors error={error} onClose={() => setError(null)} />

      <StudentFlashcardSet
        flashcards={dueFlashcardsByCourseId.map((x) => ({
          id: x.id,
          _flashcard: x,
        }))}
        onComplete={() => router.push(`/courses/${courseId}`)}
        onError={setError}
      />
    </main>
  );
}
