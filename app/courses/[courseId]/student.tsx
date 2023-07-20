"use client";
import { studentCourseIdQuery } from "@/__generated__/studentCourseIdQuery.graphql";
import { studentCourseIdScoreboardQuery } from "@/__generated__/studentCourseIdScoreboardQuery.graphql";
import {
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { chain } from "lodash";
import Error from "next/error";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";

import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import {
  ChapterContent,
  ChapterContentItem,
} from "@/components/ChapterContent";
import { ChapterHeader } from "@/components/ChapterHeader";
import { FlashcardContent, MediaContent } from "@/components/Content";
import { RewardScores } from "@/components/RewardScores";
import { Info } from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import dayjs from "dayjs";
import { useState } from "react";
import Link from "next/link";

interface Data {
  name: string;
  power: number;
}

function createData(name: string, power: number) {
  return { name, power };
}

export default function StudentCoursePage() {
  // Get course id from url
  const params = useParams();
  const id = params.courseId;

  // Info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Fetch course data
  const { coursesById } = useLazyLoadQuery<studentCourseIdQuery>(
    graphql`
      query studentCourseIdQuery($id: [UUID!]!) {
        coursesById(ids: $id) {
          title
          description
          rewardScores {
            ...RewardScoresFragment
          }
          chapters {
            elements {
              id
              title
              number
              startDate
              endDate
              suggestedStartDate
              suggestedEndDate
              contents {
                ...ContentFlashcardFragment
                ...ContentMediaFragment
                ...ContentVideoFragment
                ...ContentPresentationFragment
                ...ContentDocumentFragment
                ...ContentUrlFragment
                ...ContentInvalidFragment

                userProgressData {
                  nextLearnDate
                }

                id
                metadata {
                  type
                }
              }
            }
          }
        }
      }
    `,
    { id: [id] }
  );

  const { scoreboard } = useLazyLoadQuery<studentCourseIdScoreboardQuery>(
    graphql`
      query studentCourseIdScoreboardQuery($courseId: UUID!) {
        scoreboard(courseId: $courseId) {
          user {
            userName
          }
          powerScore
        }
      }
    `,
    { courseId: id }
  );

  // Show 404 error page if id was not found
  if (coursesById.length == 0) {
    return <Error statusCode={404} title="Course could not be found." />;
  }

  // Extract scoreboard
  const rows: Data[] = scoreboard
    .slice(0, 3)
    .map((element) => createData(element.user.userName, element.powerScore));

  // Extract course
  const course = coursesById[0];

  const nextFlashcard = chain(course.chapters.elements)
    .flatMap((x) => x.contents)
    .filter((x) => x.metadata.type === "FLASHCARDS")
    .minBy((x) => new Date(x.userProgressData.nextLearnDate))
    .value();
  const nextVideo = chain(course.chapters.elements)
    .flatMap((x) => x.contents)
    .filter((x) => x.metadata.type === "MEDIA")
    .minBy((x) => new Date(x.userProgressData.nextLearnDate))
    .value();

  return (
    <main>
      <div className="flex gap-4 items-center">
        <Typography variant="h1">{course.title}</Typography>
        <IconButton onClick={() => setInfoDialogOpen(true)}>
          <Info />
        </IconButton>
      </div>
      <InfoDialog
        open={infoDialogOpen}
        title={course.title}
        description={course.description}
        onClose={() => setInfoDialogOpen(false)}
      />
      <div className="grid grid-cols-2">
        <div className="w-fit my-12 pl-8 pr-10 py-6 border-4 border-slate-200 rounded-3xl">
          <RewardScores _scores={course.rewardScores} />
        </div>
        <div>
          <TableContainer component={Paper} className="my-12">
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell align="right">Power</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.power}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Link href={{ pathname: `${id}/scoreboard` }}>
            <Button variant="text" endIcon={<NavigateNextIcon />}>
              Full Scoreboard
            </Button>
          </Link>
        </div>
      </div>

      <section className="mt-16">
        <Typography variant="h2">Up next</Typography>
        <div className="mt-8 gap-8 grid gap-x-12 gap-y-4 grid-cols-[max-content] xl:grid-cols-[repeat(2,max-content)] 2xl:grid-cols-[repeat(3,max-content)]">
          {nextFlashcard && <FlashcardContent _flashcard={nextFlashcard} />}
          {nextVideo && <MediaContent _media={nextVideo} />}
        </div>
      </section>

      {course.chapters.elements.map((chapter) => (
        <section key={chapter.id} className="mt-24">
          <ChapterHeader
            title={chapter.title}
            subtitle={`${dayjs(
              chapter.suggestedStartDate ?? chapter.startDate
            ).format("D. MMMM")} – ${dayjs(
              chapter.suggestedEndDate ?? chapter.endDate
            ).format("D. MMMM")}`}
            progress={70}
            skill_levels={{
              remember: "green",
              understand: "green",
              apply: "yellow",
              analyze: "red",
            }}
          />
          <ChapterContent>
            {chapter.contents.length > 0 && (
              <ChapterContentItem first last>
                {chapter.contents.map((content) =>
                  content.metadata.type === "FLASHCARDS" ? (
                    <FlashcardContent key={content.id} _flashcard={content} />
                  ) : content.metadata.type === "MEDIA" ? (
                    <MediaContent _media={content} />
                  ) : null
                )}
              </ChapterContentItem>
            )}
          </ChapterContent>
        </section>
      ))}
    </main>
  );
}

function InfoDialog({
  title,
  description,
  open,
  onClose,
}: {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <Typography variant="body1" sx={{ padding: 3, paddingTop: 0 }}>
        {description}
      </Typography>
    </Dialog>
  );
}
