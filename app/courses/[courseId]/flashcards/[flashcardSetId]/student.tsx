"use client";

import { studentFlashcardLogProgressMutation } from "@/__generated__/studentFlashcardLogProgressMutation.graphql";
import { studentFlashcardsQuery } from "@/__generated__/studentFlashcardsQuery.graphql";
import { Heading } from "@/components/Heading";
import { Check, Close, Loop } from "@mui/icons-material";
import { Alert, Button, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { chain } from "lodash";
import Error from "next/error";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

export default function StudentFlashcards() {
  // Get course id from url
  const { flashcardSetId, courseId } = useParams();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch course data
  const { findContentsByIds, currentUserInfo } =
    useLazyLoadQuery<studentFlashcardsQuery>(
      graphql`
        query studentFlashcardsQuery($id: [UUID!]!) {
          currentUserInfo {
            id
          }
          findContentsByIds(ids: $id) {
            id
            metadata {
              name
            }
            ... on FlashcardSetAssessment {
              flashcardSet {
                flashcards {
                  id
                  sides {
                    isQuestion
                    label
                    text {
                      text
                      referencedMediaRecordIds
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { id: [flashcardSetId] }
    );

  const [flashcardLearned, logging] =
    useMutation<studentFlashcardLogProgressMutation>(graphql`
      mutation studentFlashcardLogProgressMutation(
        $input: LogFlashcardLearnedInput!
      ) {
        logFlashcardLearned(input: $input) {
          id
        }
      }
    `);

  const [turned, setTurned] = useState<Record<string, boolean>>({});
  const [knew, setKnew] = useState<Record<string, boolean>>({});

  const router = useRouter();

  const [error, setError] = useState<any>(null);

  const flashcards = findContentsByIds[0];
  if (!flashcards) {
    return <Error statusCode={404} />;
  }
  const currentFlashcard = flashcards.flashcardSet!.flashcards[currentIndex];
  const question = currentFlashcard.sides.find((x) => x.isQuestion);
  const answers = currentFlashcard.sides.filter((x) => !x.isQuestion);

  const nextCard = async () => {
    const knewAll = chain(currentFlashcard.sides)
      .filter((x) => !x.isQuestion)
      .map((x) => knew[x.label] ?? false)
      .every()
      .value();

    flashcardLearned({
      variables: {
        input: {
          flashcardId: currentFlashcard.id,
          successful: knewAll,
          userId: currentUserInfo.id,
        },
      },
      onCompleted() {
        if (
          currentIndex + 1 <
          (flashcards.flashcardSet?.flashcards.length ?? 0)
        ) {
          setCurrentIndex(currentIndex + 1);
          setKnew({});
          setTurned({});
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

      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center">
        <div className="bg-white -mb-[9px] px-3 text-xs text-gray-600">
          {currentIndex + 1}/{flashcards.flashcardSet?.flashcards.length ?? 0}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">
        {question?.text.text}
      </div>

      <div className="w-full border-b border-b-gray-300 mt-6 flex justify-center mb-6"></div>

      <div className="flex justify-center gap-4">
        {answers.map((answer) => (
          <motion.div
            key={answer.label}
            initial={false}
            animate={{
              rotateY: turned[answer.label] ? 180 : 0,
              scaleX: turned[answer.label] ? -1 : 1,
            }}
            onClick={(e) => {
              setTurned({ ...turned, [answer.label]: true });
              e.stopPropagation();
            }}
            className={`grid w-80 aspect-video rounded-xl shadow-xl border items-center justify-center ${
              turned[answer.label]
                ? ""
                : "hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
            }`}
          >
            <motion.div
              className="col-start-1 row-start-1 text-center p-3"
              animate={{ opacity: turned[answer.label] ? 0 : 1 }}
              initial={false}
              transition={{ duration: 0.09, delay: 0.05 }}
            >
              <Loop className="w-2 h-2 text-gray-600" />
              <br />
              <br />
              {answer.label}
            </motion.div>

            <motion.div
              className="col-start-1 row-start-1 text-center p-3 h-full flex flex-col justify-between"
              animate={{ opacity: turned[answer.label] ? 1 : 0 }}
              initial={false}
              transition={{ duration: 0.09, delay: 0.05 }}
            >
              <ReactMarkdown>{answer.text.text}</ReactMarkdown>

              <div className="mt-6 flex gap-2 justify-center w-full">
                <Button
                  size="small"
                  variant="contained"
                  color={
                    knew[answer.label] === undefined ||
                    knew[answer.label] === true
                      ? "success"
                      : "inherit"
                  }
                  disabled={!turned[answer.label]}
                  onClick={(e) => setKnew({ ...knew, [answer.label]: true })}
                  startIcon={<Check className="text-white" />}
                >
                  <span className="text-white">Correct</span>
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color={
                    knew[answer.label] === undefined ||
                    knew[answer.label] === false
                      ? "error"
                      : "inherit"
                  }
                  disabled={!turned[answer.label]}
                  onClick={(e) => setKnew({ ...knew, [answer.label]: false })}
                  startIcon={<Close className="text-white" />}
                >
                  <span className="text-white">Wrong</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
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
