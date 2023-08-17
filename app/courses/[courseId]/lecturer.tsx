"use client";
import { lecturerLecturerCourseIdQuery } from "@/__generated__/lecturerLecturerCourseIdQuery.graphql";
import { IconButton, Typography } from "@mui/material";
import Error from "next/error";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";

import { AddChapterModal } from "@/components/AddChapterModal";
import { AddSectionButton } from "@/components/AddSectionButton";
import { AddStageButton } from "@/components/AddStageButton";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterHeader } from "@/components/ChapterHeader";
import { Content, ContentLink, ProgressFrame } from "@/components/Content";
import { DeleteStageButton } from "@/components/DeleteStageButton";
import { EditChapterModal } from "@/components/EditChapterModal";
import { EditCourseModal } from "@/components/EditCourseModal";
import EditSectionButton from "@/components/EditSectionButton";
import { Section, SectionContent, SectionHeader } from "@/components/Section";
import { Stage } from "@/components/Stage";
import { Add, RemoveRedEye, Settings } from "@mui/icons-material";
import dayjs from "dayjs";
import { orderBy } from "lodash";
import { useState } from "react";
import { AddContentModal } from "../../../components/AddContentModal";

graphql`
  fragment lecturerSectionFragment on Section {
    id
    name
    stages {
      ...lecturerStageFragment @relay(mask: false)
    }
  }
`;

graphql`
  fragment lecturerStageFragment on Stage {
    optionalContentsProgress
    requiredContentsProgress
    id
    position
    requiredContents {
      ...ContentLinkFragment

      userProgressData {
        nextLearnDate
      }
      __typename
      id
    }

    optionalContents {
      ...ContentLinkFragment

      userProgressData {
        nextLearnDate
      }
      __typename
      id
    }
  }
`;

export default function LecturerCoursePage() {
  // Get course id from url
  const params = useParams();
  const id = params.courseId;

  // Info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Fetch course data
  const { coursesByIds, ...query } =
    useLazyLoadQuery<lecturerLecturerCourseIdQuery>(
      graphql`
        query lecturerLecturerCourseIdQuery($id: [UUID!]!) {
          ...MediaRecordSelector

          coursesByIds(ids: $id) {
            title
            description
            ...AddChapterModalFragment
            ...EditCourseModalFragment
            chapters {
              elements {
                __id
                ...EditChapterModalFragment
                ...AddFlashcardSetModalFragment
                ...AddContentModalFragment
                id
                title
                number
                startDate
                endDate
                suggestedStartDate
                suggestedEndDate
                sections {
                  ...lecturerSectionFragment @relay(mask: false)
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
  if (coursesByIds.length == 0) {
    return <Error statusCode={404} title="Course could not be found." />;
  }

  // Extract course
  const course = coursesByIds[0];

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
            subtitle={`${dayjs(
              chapter.suggestedStartDate ?? chapter.startDate
            ).format("D. MMMM")} – ${dayjs(
              chapter.suggestedEndDate ?? chapter.endDate
            ).format("D. MMMM")}`}
            progress={0}
          />

          <ChapterContent>
            {chapter.sections.map((section) => (
              <Section key={section.id}>
                <SectionHeader
                  action={
                    <EditSectionButton
                      name={section.name}
                      sectionId={section.id}
                    />
                  }
                >
                  {section.name}
                </SectionHeader>
                <SectionContent>
                  {orderBy(section.stages, (x) => x.position, "asc").map(
                    (stage) => (
                      <Stage
                        progress={stage.requiredContentsProgress}
                        key={section.id}
                      >
                        {stage.requiredContents.map((content) => (
                          <ContentLink key={content.id} _content={content} />
                        ))}
                        {stage.optionalContents.map((content) => (
                          <ContentLink key={content.id} _content={content} />
                        ))}
                        <div className="mt-4 flex flex-col items-start">
                          <AddContentModal
                            stageId={stage.id}
                            chapterId={chapter.id}
                            _mediaRecords={query}
                            _chapter={chapter}
                            optionalRecords={stage.optionalContents.map(
                              (x) => x.id
                            )}
                            requiredRecords={stage.requiredContents.map(
                              (x) => x.id
                            )}
                          />
                        </div>
                        <div className="mt-2">
                          <DeleteStageButton
                            stageId={stage.id}
                            sectionId={section.id}
                          />
                        </div>
                      </Stage>
                    )
                  )}
                  <Stage progress={0}>
                    <AddStageButton sectionId={section.id} />
                  </Stage>
                </SectionContent>
              </Section>
            ))}
            <AddSectionButton chapterId={chapter.id} />
          </ChapterContent>
        </section>
      ))}
    </main>
  );
}
