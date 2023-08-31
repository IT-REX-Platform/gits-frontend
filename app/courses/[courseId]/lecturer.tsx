"use client";
import { lecturerLecturerCourseIdQuery } from "@/__generated__/lecturerLecturerCourseIdQuery.graphql";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Typography,
} from "@mui/material";
import Error from "next/error";
import { useParams, useRouter } from "next/navigation";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { lecturerAddStageContentModal$key } from "@/__generated__/lecturerAddStageContentModal.graphql";
import { lecturerEditChapterModalMutation } from "@/__generated__/lecturerEditChapterModalMutation.graphql";
import { AddChapterModal } from "@/components/AddChapterModal";
import { AddFlashcardSetModal } from "@/components/AddFlashcardSetModal";
import { AddSectionButton } from "@/components/AddSectionButton";
import { AddStageButton } from "@/components/AddStageButton";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterHeader } from "@/components/ChapterHeader";
import { ContentLink } from "@/components/Content";
import { DeleteStageButton } from "@/components/DeleteStageButton";
import { EditCourseModal } from "@/components/EditCourseModal";
import EditSectionButton from "@/components/EditSectionButton";
import { Section, SectionContent, SectionHeader } from "@/components/Section";
import { Stage } from "@/components/Stage";
import { Add, ArrowForward, Settings } from "@mui/icons-material";
import { orderBy } from "lodash";
import { useEffect, useState } from "react";
import { MediaContentModal } from "../../../components/MediaContentModal";
import EditChapterButton from "@/components/EditChapterButton";
import { Heading } from "@/components/Heading";

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
                ...EditChapterButtonFragment
                ...AddFlashcardSetModalFragment
                ...lecturerAddStageContentModal
                ...ChapterHeaderFragment
                id
                title
                number
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
                          <ContentLink key={content.id} _content={content} />
                        ))}
                        {stage.optionalContents.map((content) => (
                          <ContentLink
                            key={content.id}
                            _content={content}
                            optional
                          />
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

function AddContentModal({
  chapterId,
  stageId,
  _chapter,
  _mediaRecords,
  optionalRecords: _optionalRecords,
  requiredRecords: _requiredRecords,
}: {
  chapterId: string;
  stageId: string;
  _mediaRecords: MediaRecordSelector$key;
  _chapter: lecturerAddStageContentModal$key;

  optionalRecords: string[];
  requiredRecords: string[];
}) {
  const [openMediaModal, setOpenMediaModal] = useState(false);
  const [openFlashcardModal, setOpenFlashcardModal] = useState(false);

  const [openModal, setOpenModal] = useState(false);

  const chapter = useFragment(
    graphql`
      fragment lecturerAddStageContentModal on Chapter {
        ...AddFlashcardSetModalFragment
        contents {
          id
          metadata {
            name
          }
          ... on FlashcardSetAssessment {
            __typename
          }
          ... on MediaContent {
            __typename
          }
          ... on QuizAssessment {
            __typename
          }
        }
      }
    `,
    _chapter
  );

  const [optionalRecords, setOptionalRecords] = useState(_optionalRecords);
  const [requiredRecords, setRequiredRecords] = useState(_requiredRecords);

  const [updateStage] = useMutation<lecturerEditChapterModalMutation>(graphql`
    mutation lecturerEditChapterModalMutation($stage: UpdateStageInput!) {
      updateStage(input: $stage) {
        id
        ...lecturerStageFragment
      }
    }
  `);

  useEffect(() => {
    setOptionalRecords(_optionalRecords);
  }, [_optionalRecords]);

  useEffect(() => {
    setRequiredRecords(_requiredRecords);
  }, [_requiredRecords]);

  const router = useRouter();

  const [error, setError] = useState<any>(null);

  const submit = () => {
    updateStage({
      variables: {
        stage: {
          id: stageId,
          requiredContents: requiredRecords,
          optionalContents: optionalRecords,
        },
      },
      onError: setError,
      onCompleted() {
        setOpenModal(false);
      },
    });
  };

  return (
    <>
      <Button startIcon={<Add />} onClick={() => setOpenModal(true)}>
        Add media
      </Button>

      <Dialog
        maxWidth="lg"
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <DialogTitle>Select media</DialogTitle>
        <DialogContent sx={{ paddingX: 0 }}>
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

          <List className="min-w-[500px]">
            {chapter.contents.map((content) => {
              const optional = optionalRecords.find((x) => x === content.id);
              const required = requiredRecords.find((x) => x === content.id);
              const toggle =
                optional || required
                  ? () => {
                      setOptionalRecords(
                        optionalRecords.filter((x) => x !== content.id)
                      );
                      setRequiredRecords(
                        requiredRecords.filter((x) => x !== content.id)
                      );
                    }
                  : () => {
                      setRequiredRecords([...requiredRecords, content.id]);
                    };

              const checked = optional || required;

              const toggleOptional = optional
                ? () => {
                    setOptionalRecords(
                      optionalRecords.filter((x) => x !== content.id)
                    );
                    setRequiredRecords([...requiredRecords, content.id]);
                  }
                : () => {
                    setOptionalRecords([...optionalRecords, content.id]);
                    setRequiredRecords(
                      requiredRecords.filter((x) => x !== content.id)
                    );
                  };

              return (
                <ListItem
                  key={content.id}
                  secondaryAction={
                    <div className="mr-2 flex gap-x-3">
                      {checked && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!required}
                              onClick={toggleOptional}
                            />
                          }
                          label={required ? "Required" : "Optional"}
                        />
                      )}

                      <IconButton
                        edge="end"
                        onClick={() =>
                          router.push(
                            content.__typename === "FlashcardSetAssessment"
                              ? `flashcards/${content.id}`
                              : content.__typename === "MediaContent"
                              ? `media/${content.id}`
                              : content.__typename === "QuizAssessment"
                              ? `quizzes/${content.id}`
                              : ""
                          )
                        }
                      >
                        <ArrowForward />
                      </IconButton>
                    </div>
                  }
                  disablePadding
                >
                  <ListItemButton onClick={toggle}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={!!checked}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>

                    <ListItemText primary={content.metadata.name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </DialogContent>

        <DialogContent>
          {/* add flashcard button */}
          <Button
            onClick={() => setOpenFlashcardModal(true)}
            variant="text"
            className="mt-4"
            startIcon={<Add />}
          >
            Add Flashcards
          </Button>
          <Button
            onClick={() => setOpenMediaModal(true)}
            variant="text"
            className="mt-4"
            startIcon={<Add />}
          >
            Add Media
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={submit}>Ok</Button>
        </DialogActions>
      </Dialog>

      <MediaContentModal
        chapterId={chapterId}
        isOpen={openMediaModal}
        onClose={() => setOpenMediaModal(false)}
        _mediaRecords={_mediaRecords}
      />
      {openFlashcardModal && (
        <AddFlashcardSetModal
          onClose={() => setOpenFlashcardModal(false)}
          _chapter={chapter}
        />
      )}
    </>
  );
}
