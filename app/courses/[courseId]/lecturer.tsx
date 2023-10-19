"use client";

import { lecturerLecturerCourseIdQuery } from "@/__generated__/lecturerLecturerCourseIdQuery.graphql";
import { Button, IconButton, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";

import { AddChapterModal } from "@/components/AddChapterModal";
import { EditCourseModal } from "@/components/EditCourseModal";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { Add, People, Settings } from "@mui/icons-material";
import { orderBy } from "lodash";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LecturerChapter } from "./LecturerChapter";

graphql`
  fragment lecturerCourseFragment on Course {
    id
    title
    description
    ...AddChapterModalFragment
    ...EditCourseModalFragment
    chapters {
      elements {
        id
        startDate
        number
        ...LecturerChapter
      }
    }
  }
`;

export default function LecturerCoursePage() {
  const router = useRouter();

  // Get course id from url
  const { courseId } = useParams();

  // Info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Fetch course data
  const { coursesByIds, currentUserInfo, ...query } =
    useLazyLoadQuery<lecturerLecturerCourseIdQuery>(
      graphql`
        query lecturerLecturerCourseIdQuery($courseId: UUID!) {
          ...MediaRecordSelector
          currentUserInfo {
            realmRoles
            courseMemberships {
              role
              course {
                id
              }
            }
          }

          coursesByIds(ids: [$courseId]) {
            ...lecturerCourseFragment @relay(mask: false)
          }
        }
      `,
      { courseId }
    );

  const [openModal, setOpenModal] = useState(false);

  // Show 404 error page if id was not found
  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id." />;
  }

  // Extract course
  const course = coursesByIds[0];
  const role = currentUserInfo.courseMemberships.find(
    (x) => x.course.id === courseId
  )!.role;

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <main>
      {openModal && (
        <AddChapterModal open _course={course} onClose={handleCloseModal} />
      )}

      <Heading
        title={course.title}
        action={
          <div className="flex gap-4 items-center">
            <Button startIcon={<Add />} onClick={() => setOpenModal(true)}>
              Add chapter
            </Button>
            {role === "ADMINISTRATOR" && (
              <Button
                startIcon={<People />}
                onClick={() => router.push(`/courses/${courseId}/members`)}
              >
                Members
              </Button>
            )}
            <IconButton onClick={() => setInfoDialogOpen(true)}>
              <Settings />
            </IconButton>
          </div>
        }
      />

      <EditCourseModal
        _course={course}
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
      />

      <Typography variant="body2" className="!mt-8 !mb-10">
        {course.description}
      </Typography>

      {orderBy(course.chapters.elements, [
        (x) => new Date(x.startDate).getTime(),
        "number",
      ]).map((chapter) => (
        <LecturerChapter
          _mediaRecords={query}
          _chapter={chapter}
          key={chapter.id}
        />
      ))}
    </main>
  );
}
