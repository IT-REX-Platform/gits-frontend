"use client";
import { pageCourseIdQuery } from "@/__generated__/pageCourseIdQuery.graphql";
import Error from "next/error";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Dialog, DialogTitle, IconButton, Typography } from "@mui/material";

import { FlashcardContent, VideoContent } from "@/components/Content";
import { ChapterHeader } from "@/components/ChapterHeader";
import {
  ChapterContent,
  ChapterContentItem,
} from "@/components/ChapterContent";
import dayjs from "dayjs";
import { RewardScores } from "@/components/RewardScores";
import { useState } from "react";
import { Info } from "@mui/icons-material";

export default function CoursePage() {
  return <StudentCoursePage />;
}

function displayContent(id: string, type: string, name: string) {
  switch (type) {
    case "MEDIA":
      return <VideoContent key={id} subtitle={name} progress={100} />;
    case "FLASHCARD":
      return <FlashcardContent key={id} subtitle={name} progress={100} />;
  }
}

function StudentCoursePage() {
  // Get course id from url
  const params = useParams();
  const id = params.courseId;

  // Info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Fetch course data
  const { coursesById } = useLazyLoadQuery<pageCourseIdQuery>(
    graphql`
      query pageCourseIdQuery($id: [UUID!]!) {
        coursesById(ids: $id) {
          title
          description
          chapters {
            elements {
              id
              title
              number
              suggestedStartDate
              suggestedEndDate
              contents {
                id
                metadata {
                  name
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

  // Show 404 error page if id was not found
  if (coursesById.length == 0) {
    return <Error statusCode={404} title="Course could not be found." />;
  }

  // Extract course
  const course = coursesById[0];

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

      <div className="w-fit my-12 pl-12 pr-16 py-6 border-x-8 border-y-4 border-slate-200 rounded-3xl">
        <RewardScores health={60} fitness={20} growth={100} power={75} />
      </div>

      <section className="mt-16">
        <Typography variant="h2">Up next</Typography>
        <div className="mt-8 flex gap-8 grid gap-x-12 gap-y-4 grid-cols-[max-content] xl:grid-cols-[repeat(2,max-content)] 2xl:grid-cols-[repeat(3,max-content)]">
          <VideoContent subtitle="Publish-Subscribe Messaging" progress={0} />
          <VideoContent subtitle="Publish-Subscribe Messaging" progress={40} />
          <FlashcardContent
            subtitle="Publish-Subscribe Messaging"
            progress={40}
          />
        </div>
      </section>

      {course.chapters.elements.map((chapter) => (
        <section key={chapter.id} className="mt-24">
          <ChapterHeader
            title={chapter.title}
            subtitle={`${dayjs(chapter.suggestedStartDate).format(
              "D. MMMM"
            )} – ${dayjs(chapter.suggestedEndDate).format("D. MMMM")}`}
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
                  displayContent(
                    content.id,
                    content.metadata.type,
                    content.metadata.name
                  )
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
