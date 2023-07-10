"use client";
import { lecturerLecturerCourseIdQuery } from "@/__generated__/lecturerLecturerCourseIdQuery.graphql";
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Error from "next/error";
import { useParams } from "next/navigation";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

import { lecturerEditCourseAddChapterModalFragment$key } from "@/__generated__/lecturerEditCourseAddChapterModalFragment.graphql";
import { lecturerEditCourseChaptersMutation } from "@/__generated__/lecturerEditCourseChaptersMutation.graphql";
import { lecturerEditCourseEditChapterModalFragment$key } from "@/__generated__/lecturerEditCourseEditChapterModalFragment.graphql";
import { lecturerEditCourseEditChaptersMutation } from "@/__generated__/lecturerEditCourseEditChaptersMutation.graphql";
import { lecturerEditCourseGeneralFragment$key } from "@/__generated__/lecturerEditCourseGeneralFragment.graphql";
import { lecturerEditCourseMutation } from "@/__generated__/lecturerEditCourseMutation.graphql";
import {
  ChapterContent,
  ChapterContentItem,
} from "@/components/ChapterContent";
import { ChapterHeader } from "@/components/ChapterHeader";
import {
  Content,
  FlashcardContent,
  ProgressFrame,
  VideoContent,
} from "@/components/Content";
import { Form, FormSection } from "@/components/Form";
import { Add, Edit, RemoveRedEye, Settings } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

export default function LecturerCoursePage() {
  // Get course id from url
  const params = useParams();
  const id = params.courseId;

  // Info dialog
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  // Fetch course data
  const { coursesById } = useLazyLoadQuery<lecturerLecturerCourseIdQuery>(
    graphql`
      query lecturerLecturerCourseIdQuery($id: [UUID!]!) {
        coursesById(ids: $id) {
          title
          description
          ...lecturerEditCourseAddChapterModalFragment
          ...lecturerEditCourseGeneralFragment

          chapters {
            elements {
              ...lecturerEditCourseEditChapterModalFragment
              id
              title
              number
              suggestedStartDate
              suggestedEndDate
              contents {
                ...ContentFlashcardFragment
                ...ContentVideoFragment

                userProgressData {
                  nextLearnDate
                }

                id
                __typename
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

  const handleOpenModal = () => {
    setOpenModal(true);
  };

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
      <EditGeneral
        _course={course}
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
      />

      <Content
        title="See overall student progress"
        className="hover:bg-gray-100 rounded-full mt-12 mb-12"
        subtitle=""
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
        className="hover:bg-gray-100 rounded-full mt-24"
        subtitle=""
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

      {course.chapters.elements.map((chapter) => (
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
            progress={70}
            skill_levels={{
              remember: "green",
              understand: "green",
              apply: "yellow",
              analyze: "red",
            }}
          />

          <ChapterContent>
            {chapter.contents?.length > 0 && (
              <ChapterContentItem first last>
                {chapter.contents.map((content) =>
                  content.__typename === "FlashcardSetAssessment" ? (
                    <FlashcardContent key={content.id} _flashcard={content} />
                  ) : content.__typename === "MediaContent" ? (
                    <VideoContent _media={content} />
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

function EditGeneral({
  _course,
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
  _course: lecturerEditCourseGeneralFragment$key;
}) {
  const course = useFragment(
    graphql`
      fragment lecturerEditCourseGeneralFragment on Course {
        id
        title
        description
        startDate
        endDate
        published
      }
    `,
    _course
  );

  const [updateCourse, isUpdating] =
    useMutation<lecturerEditCourseMutation>(graphql`
      mutation lecturerEditCourseMutation($course: UpdateCourseInput!) {
        updateCourse(input: $course) {
          id
          ...lecturerEditCourseGeneralFragment
        }
      }
    `);

  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs(course.startDate)
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(course.endDate));
  const [publish, setPublish] = useState(course.published);

  const [error, setError] = useState<any>(null);
  const valid =
    title !== "" &&
    startDate != null &&
    startDate.isValid() &&
    endDate != null &&
    endDate.isValid();

  function handleSubmit() {
    updateCourse({
      variables: {
        course: {
          id: course.id,
          title,
          description,
          startDate: startDate!.toISOString(),
          endDate: endDate!.toISOString(),
          published: publish,
        },
      },
      onError(error) {
        setError(error);
      },
      onCompleted() {
        onClose();
      },
    });
  }

  function handleReset() {
    setTitle(course.title);
    setDescription(course.description);
    setStartDate(dayjs(course.startDate));
    setEndDate(dayjs(course.endDate));
    setPublish(course.published);
    setError(null);
  }

  return (
    <>
      <Dialog maxWidth="lg" onClose={onClose} open={open}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
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
          <Form>
            <FormSection title="Course details">
              <TextField
                className="w-96"
                label="Title"
                variant="outlined"
                value={title}
                error={title === ""}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                className="w-96"
                label="Description"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
              />
            </FormSection>

            <FormSection title="Start and end">
              <DatePicker
                label="Start date"
                value={startDate}
                maxDate={endDate ?? undefined}
                onChange={setStartDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: startDate == null || !startDate.isValid(),
                  },
                }}
              />
              <DatePicker
                label="End date"
                value={endDate}
                minDate={startDate ?? undefined}
                defaultCalendarMonth={startDate ?? undefined}
                onChange={setEndDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: endDate == null || !endDate.isValid(),
                  },
                }}
              />
            </FormSection>

            <FormSection title="Published">
              <Switch
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
              />
            </FormSection>
          </Form>
          <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
            <CircularProgress />
          </Backdrop>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset}>Reset</Button>
          <Button disabled={!valid} variant="contained" onClick={handleSubmit}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function EditChapterModal({
  _chapter,
}: {
  _chapter: lecturerEditCourseEditChapterModalFragment$key;
}) {
  const [openModal, setOpenModal] = useState(false);

  const chapter = useFragment(
    graphql`
      fragment lecturerEditCourseEditChapterModalFragment on Chapter {
        id
        title
        description
        startDate
        endDate
        suggestedStartDate
        suggestedEndDate
        course {
          id
        }
        number
      }
    `,
    _chapter
  );

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTitle(chapter.title);
    setDescription(chapter.description);
    setStartDate(dayjs(chapter.startDate));
    setEndDate(dayjs(chapter.endDate));
    setSuggestedStartDate(dayjs(chapter.suggestedStartDate));
    setSuggestedEndDate(dayjs(chapter.suggestedEndDate));
  };

  const [title, setTitle] = useState(chapter.title);
  const [description, setDescription] = useState(chapter.description);
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs(chapter.startDate)
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(chapter.endDate));
  const [suggestedStartDate, setSuggestedStartDate] = useState<Dayjs | null>(
    dayjs(chapter.suggestedStartDate)
  );
  const [suggestedEndDate, setSuggestedEndDate] = useState<Dayjs | null>(
    dayjs(chapter.suggestedEndDate)
  );

  const [error, setError] = useState<any>(null);
  const valid =
    title !== "" &&
    startDate != null &&
    startDate.isValid() &&
    endDate != null &&
    endDate.isValid();

  const [updateChapter, isUpdating] =
    useMutation<lecturerEditCourseEditChaptersMutation>(graphql`
      mutation lecturerEditCourseEditChaptersMutation(
        $chapter: UpdateChapterInput!
      ) {
        updateChapter(input: $chapter) {
          id
          ...lecturerEditCourseEditChapterModalFragment
        }
      }
    `);

  function handleSubmit() {
    updateChapter({
      variables: {
        chapter: {
          id: chapter.id,
          title,
          description,
          startDate: startDate!.toISOString(),
          endDate: endDate!.toISOString(),
          suggestedStartDate: suggestedStartDate!.toISOString(),
          suggestedEndDate: suggestedEndDate!.toISOString(),
          number: chapter.number,
        },
      },
      onCompleted() {
        handleCloseModal();
      },
      onError(error) {
        setError(error);
      },
    });
  }

  return (
    <>
      <div onClick={handleOpenModal} className="cursor-pointer">
        <Edit className="text-gray-400 mb-1" fontSize="small" />
      </div>
      <Dialog maxWidth="md" open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Edit Chapter</DialogTitle>
        <DialogContent>
          {error?.source.errors.map((err: any, i: number) => (
            <Alert key={i} severity="error" onClose={() => setError(null)}>
              {err.message}
            </Alert>
          ))}
          <Form>
            <FormSection title="General">
              <TextField
                className="w-96"
                label="Title"
                variant="outlined"
                value={title}
                error={title === ""}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                className="w-96"
                label="Description"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
              />
            </FormSection>

            <FormSection title="Start and end">
              <DatePicker
                label="Start date"
                value={startDate}
                maxDate={endDate ?? undefined}
                onChange={setStartDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: startDate == null || !startDate.isValid(),
                  },
                }}
              />
              <DatePicker
                label="End date"
                value={endDate}
                minDate={startDate ?? undefined}
                defaultCalendarMonth={startDate ?? undefined}
                onChange={setEndDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: endDate == null || !endDate.isValid(),
                  },
                }}
              />
            </FormSection>
            <FormSection title="Suggested start and end">
              <DatePicker
                label="Suggested start date"
                value={suggestedStartDate}
                maxDate={suggestedEndDate ?? undefined}
                onChange={setSuggestedStartDate}
                slotProps={{
                  textField: {
                    required: true,
                    error:
                      suggestedStartDate == null ||
                      !suggestedStartDate.isValid(),
                  },
                }}
              />
              <DatePicker
                label="Suggested end date"
                value={suggestedEndDate}
                minDate={suggestedStartDate ?? undefined}
                defaultCalendarMonth={suggestedStartDate ?? undefined}
                onChange={setSuggestedEndDate}
                slotProps={{
                  textField: {
                    required: true,
                    error:
                      suggestedEndDate == null || !suggestedEndDate.isValid(),
                  },
                }}
              />
            </FormSection>
          </Form>
          <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
            <CircularProgress />
          </Backdrop>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button disabled={!valid} onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
    </>
  );
}

function AddChapterModal({
  open,
  onClose,
  _course,
}: {
  open: boolean;
  onClose: () => void;
  _course: lecturerEditCourseAddChapterModalFragment$key;
}) {
  const course = useFragment(
    graphql`
      fragment lecturerEditCourseAddChapterModalFragment on Course {
        id
        chapters {
          elements {
            id
            title
          }
        }
      }
    `,
    _course
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [suggestedStartDate, setSuggestedStartDate] = useState<Dayjs | null>(
    dayjs()
  );
  const [suggestedEndDate, setSuggestedEndDate] = useState<Dayjs | null>(
    dayjs()
  );

  const [error, setError] = useState<any>(null);
  const valid =
    title !== "" &&
    startDate != null &&
    startDate.isValid() &&
    endDate != null &&
    endDate.isValid();

  const [addChapter, isUpdating] =
    useMutation<lecturerEditCourseChaptersMutation>(graphql`
      mutation lecturerEditCourseChaptersMutation(
        $chapter: CreateChapterInput!
      ) {
        createChapter(input: $chapter) {
          id
          course {
            ...lecturerEditCourseAddChapterModalFragment
          }
        }
      }
    `);

  function handleSubmit() {
    const nextCourseNumber = course.chapters.elements.length + 1;

    addChapter({
      variables: {
        chapter: {
          courseId: course.id,
          title,
          description,
          startDate: startDate!.toISOString(),
          endDate: endDate!.toISOString(),
          suggestedEndDate: suggestedEndDate?.toISOString(),
          suggestedStartDate: suggestedStartDate?.toISOString(),
          number: nextCourseNumber,
        },
      },
      onCompleted() {
        onClose();
      },
      onError(error) {
        setError(error);
      },
    });
  }

  return (
    <>
      <Dialog maxWidth="md" open={open} onClose={onClose}>
        <DialogTitle>Add a Chapter</DialogTitle>
        <DialogContent>
          {error?.source.errors.map((err: any, i: number) => (
            <Alert key={i} severity="error" onClose={() => setError(null)}>
              {err.message}
            </Alert>
          ))}
          <Form>
            <FormSection title="General">
              <TextField
                className="w-96"
                label="Title"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <TextField
                className="w-96"
                label="Description"
                variant="outlined"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
              />
            </FormSection>

            <FormSection title="Start and end">
              <DatePicker
                label="Start date"
                value={startDate}
                maxDate={endDate ?? undefined}
                onChange={setStartDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: startDate?.isValid() === false,
                  },
                }}
              />
              <DatePicker
                label="End date"
                value={endDate}
                minDate={startDate ?? undefined}
                defaultCalendarMonth={startDate ?? undefined}
                onChange={setEndDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: endDate?.isValid() === false,
                  },
                }}
              />
            </FormSection>

            <FormSection title="Suggested start and end">
              <DatePicker
                label="Suggested start date"
                value={suggestedStartDate}
                maxDate={endDate ?? undefined}
                onChange={setSuggestedStartDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: suggestedStartDate?.isValid() === false,
                  },
                }}
              />
              <DatePicker
                label="Suggested end date"
                value={suggestedEndDate}
                minDate={suggestedStartDate ?? undefined}
                defaultCalendarMonth={suggestedStartDate ?? undefined}
                onChange={setSuggestedEndDate}
                slotProps={{
                  textField: {
                    required: true,
                    error: suggestedEndDate?.isValid() === false,
                  },
                }}
              />
            </FormSection>
          </Form>
          <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
            <CircularProgress />
          </Backdrop>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} onClick={handleSubmit}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
    </>
  );
}
