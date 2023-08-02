"use client";
import { lecturerLecturerCourseIdQuery } from "@/__generated__/lecturerLecturerCourseIdQuery.graphql";
import { Button, IconButton, Typography } from "@mui/material";
import Error from "next/error";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";

import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterHeader } from "@/components/ChapterHeader";
import { Content, ContentLink, ProgressFrame } from "@/components/Content";
import { Add, RemoveRedEye, Settings } from "@mui/icons-material";
import dayjs from "dayjs";
import { orderBy } from "lodash";
import { useState } from "react";
import { MediaContentModal } from "../../../components/MediaContentModal";
import { WorkPath, WorkPathContent } from "@/components/WorkPath";
import { WorkPathStage } from "@/components/WorkPathStage";
import { AddFlashcardSetModal } from "@/components/AddFlashcardSetModal";
import { AddChapterModal } from "@/components/AddChapterModal";
import { EditChapterModal } from "@/components/EditChapterModal";
import { EditCourseModal } from "@/components/EditCourseModal";
import { AddFlashcardSetModalFragment$key } from "@/__generated__/AddFlashcardSetModalFragment.graphql";

export default function LecturerCoursePage() {
  // Get course id from url
  const params = useParams();
  const id = params.courseId;

  // Info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Fetch course data
  const { coursesById, ...query } =
    useLazyLoadQuery<lecturerLecturerCourseIdQuery>(
      graphql`
        query lecturerLecturerCourseIdQuery($id: [UUID!]!) {
          ...MediaRecordSelector

          coursesById(ids: $id) {
            title
            description
            ...AddChapterModalFragment
            ...EditCourseModalFragment
            chapters {
              elements {
                __id
                ...EditChapterModalFragment
                ...AddFlashcardSetModalFragment
                id
                title
                number
                suggestedStartDate
                suggestedEndDate
                contents {
                  ...ContentLinkFragment

                  userProgressData {
                    nextLearnDate
                  }
                  __typename
                  id
                }
              }
            }
          }
        }
      `,
      { id: [id] }
    );

  const [openModal, setOpenModal] = useState(false);

  // Show 404 error page if id was not found
  if (coursesById.length == 0) {
    return <Error statusCode={404} title="Course could not be found." />;
  }

  // Extract course
  const course = coursesById[0];

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <main>
      {openModal && (
        <AddChapterModal open _course={course} onClose={handleCloseModal} />
      )}

      <div className="flex w-full gap-4 items-center justify-between">
        <Typography variant="h1">{course.title}</Typography>
        <IconButton onClick={() => setInfoDialogOpen(true)}>
          <Settings />
        </IconButton>
      </div>
      <EditCourseModal
        _course={course}
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
      />

      <Content
        title="See overall student progress"
        className="hover:bg-gray-100 rounded-full mt-12 mb-12"
        icon={
          <RemoveRedEye
            sx={{
              fontSize: "2rem",
              color: "text.secondary",
            }}
          />
        }
        iconFrame={<ProgressFrame color="lightblue" progress={0} />}
      />

      <Typography variant="body2">{course.description}</Typography>

      <Content
        title="Add new chapter"
        className="hover:bg-gray-100 rounded-full my-16"
        onClick={() => setOpenModal(true)}
        icon={
          <Add
            sx={{
              fontSize: "2rem",
              color: "text.secondary",
            }}
          />
        }
        iconFrame={<ProgressFrame color="lightblue" progress={0} />}
      />

      {orderBy(course.chapters.elements, (x) => x.number).map((chapter) => (
        <section key={chapter.id} className="mt-6">
          <ChapterHeader
            title={
              <div className="flex gap-2">
                {chapter.title} <EditChapterModal _chapter={chapter} />
              </div>
            }
            subtitle={`${dayjs(chapter.suggestedStartDate).format(
              "D. MMMM"
            )} – ${dayjs(chapter.suggestedEndDate).format("D. MMMM")}`}
            progress={0}
          />

          <ChapterContent>
            <WorkPath>
              <WorkPathContent>
                <WorkPathStage progress={0}>
                  {chapter.contents.map((content) => (
                    <ContentLink key={content.id} _content={content} />
                  ))}
                  <div className="mt-4 flex flex-col items-start">
                    <AddFlashcardSetButton _chapter={chapter} />
                    <AddMediaButton
                      _mediaRecords={query}
                      chapterId={chapter.id}
                    />
                  </div>
                </WorkPathStage>
              </WorkPathContent>
            </WorkPath>
          </ChapterContent>
        </section>
      ))}
    </main>
  );
}

function AddMediaButton({
  chapterId,
  _mediaRecords,
}: {
  chapterId: string;
  _mediaRecords: MediaRecordSelector$key;
}) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button startIcon={<Add />} onClick={() => setOpenModal(true)}>
        Add media
      </Button>

      <MediaContentModal
        chapterId={chapterId}
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        _mediaRecords={_mediaRecords}
      />
    </>
  );
}

function AddFlashcardSetButton({
  _chapter,
}: {
  _chapter: AddFlashcardSetModalFragment$key;
}) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <Button startIcon={<Add />} onClick={() => setOpenModal(true)}>
        Add flashcards
      </Button>

      {openModal && (
        <AddFlashcardSetModal
          onClose={() => setOpenModal(false)}
          _chapter={_chapter}
        />
      )}
    </>
  );
}
