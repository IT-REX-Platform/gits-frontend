"use client";
import { lecturerLecturerCourseIdQuery } from "@/__generated__/lecturerLecturerCourseIdQuery.graphql";
import { Button, IconButton, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { graphql, useLazyLoadQuery } from "react-relay";

import { AddChapterModal } from "@/components/AddChapterModal";
import { AddSectionButton } from "@/components/AddSectionButton";
import { AddStageButton } from "@/components/AddStageButton";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterHeader } from "@/components/ChapterHeader";
import { ContentLink } from "@/components/Content";
import { DeleteStageButton } from "@/components/DeleteStageButton";
import EditChapterButton from "@/components/EditChapterButton";
import { EditCourseModal } from "@/components/EditCourseModal";
import EditSectionButton from "@/components/EditSectionButton";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { Section, SectionContent, SectionHeader } from "@/components/Section";
import { Stage } from "@/components/Stage";
import { Add, Settings } from "@mui/icons-material";
import { orderBy } from "lodash";
import { useState } from "react";
import { AddContentModal } from "../../../components/AddContentModal";
import { OtherContent } from "@/components/OtherContent";

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

graphql`
  fragment lecturerCourseFragment on Course {
    id
    title
    description
    ...AddChapterModalFragment
    ...EditCourseModalFragment
    chapters {
      elements {
        __id
        ...EditChapterButtonFragment
        ...AddFlashcardSetModalFragment
        ...AddContentModalFragment
        ...ChapterHeaderFragment
        ...OtherContentFragment
        id
        title
        number
        sections {
          ...lecturerSectionFragment @relay(mask: false)
        }
        contentsWithNoSection {
          id
          ...ContentLinkFragment
        }
      }
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
            ...lecturerCourseFragment @relay(mask: false)
          }
        }
      `,
      { id: [id] }
    );

  const [openModal, setOpenModal] = useState(false);

  // Show 404 error page if id was not found
  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id." />;
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

      <Heading
        title={course.title}
        action={
          <div className="flex gap-4 items-center">
            <Button startIcon={<Add />} onClick={() => setOpenModal(true)}>
              Add chapter
            </Button>
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

      {orderBy(course.chapters.elements, (x) => x.number).map((chapter) => (
        <section key={chapter.id} className="mb-6">
          <ChapterHeader
            courseId={id}
            _chapter={chapter}
            action={<EditChapterButton _chapter={chapter} />}
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
                      <Stage progress={0} key={stage.id}>
                        {stage.requiredContents.map((content) => (
                          <ContentLink
                            courseId={course.id}
                            key={content.id}
                            _content={content}
                          />
                        ))}
                        {stage.optionalContents.map((content) => (
                          <ContentLink
                            courseId={course.id}
                            key={content.id}
                            _content={content}
                            optional
                          />
                        ))}
                        <div className="mt-4 flex flex-col items-start">
                          <AddContentModal
                            sectionId={section.id}
                            courseId={course.id}
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

          <OtherContent _chapter={chapter} />
        </section>
      ))}
    </main>
  );
}
