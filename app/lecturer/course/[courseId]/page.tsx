"use client";

import { pageEditCourseAddChapterModalFragment$key } from "@/__generated__/pageEditCourseAddChapterModalFragment.graphql";
import { pageEditCourseChaptersFragment$key } from "@/__generated__/pageEditCourseChaptersFragment.graphql";
import { pageEditCourseChaptersMutation } from "@/__generated__/pageEditCourseChaptersMutation.graphql";
import { pageEditCourseEditChapterModalFragment$key } from "@/__generated__/pageEditCourseEditChapterModalFragment.graphql";
import { pageEditCourseEditChaptersMutation } from "@/__generated__/pageEditCourseEditChaptersMutation.graphql";
import { pageEditCourseGeneralFragment$key } from "@/__generated__/pageEditCourseGeneralFragment.graphql";
import { pageEditCourseMutation } from "@/__generated__/pageEditCourseMutation.graphql";
import { pageEditCourseQuery } from "@/__generated__/pageEditCourseQuery.graphql";
import { Form, FormActions, FormSection } from "@/components/Form";
import { Heading } from "@/components/Heading";
import { Add, Edit } from "@mui/icons-material";

import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import {
  Backdrop,
  Button,
  CircularProgress,
  Switch,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import NextError from "next/error";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

export default function EditCoursePage() {
  const params = useParams();
  const { coursesById } = useLazyLoadQuery<pageEditCourseQuery>(
    graphql`
      query pageEditCourseQuery($id: [UUID!]!) {
        coursesById(ids: $id) {
          ...pageEditCourseGeneralFragment
          ...pageEditCourseChaptersFragment
        }
      }
    `,
    { id: [params.courseId] }
  );

  const [tab, setTab] = useState<"General" | "Chapters">("General");

  // Show 404 error page if id was not found
  if (coursesById.length == 0) {
    return <NextError statusCode={404} />;
  }

  return (
    <main className="flex flex-col gap-3">
      <div className="w-full bg-sky-700">
        <Heading className="text-white">Edit Course</Heading>
        <div className="mt-5 ml-10 flex flex-row justify-start">
          {["General" as const, "Chapters" as const].map((title) => (
            <div
              className={
                "py-2 px-6 text-white font-bold cursor-pointer " +
                (tab === title
                  ? "border-b-2 border-white bg-sky-600"
                  : "hover:bg-sky-600 ")
              }
              key={title}
              onClick={() => setTab(title)}
            >
              {title}
            </div>
          ))}
        </div>
      </div>
      <div className="px-6">
        {tab === "General" && <EditGeneral _course={coursesById[0]} />}
        {tab === "Chapters" && <EditChapters _course={coursesById[0]} />}
      </div>
    </main>
  );
}

function EditGeneral({
  _course,
}: {
  _course: pageEditCourseGeneralFragment$key;
}) {
  const course = useFragment(
    graphql`
      fragment pageEditCourseGeneralFragment on Course {
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
    useMutation<pageEditCourseMutation>(graphql`
      mutation pageEditCourseMutation($course: UpdateCourseInput!) {
        updateCourse(input: $course) {
          id
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

        <FormActions>
          <Button disabled={!valid} variant="contained" onClick={handleSubmit}>
            Update
          </Button>
          <Button onClick={handleReset}>Reset</Button>
        </FormActions>
      </Form>
      <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
    </>
  );
}

function EditChapters({
  _course,
}: {
  _course: pageEditCourseChaptersFragment$key;
}) {
  const course = useFragment(
    graphql`
      fragment pageEditCourseChaptersFragment on Course {
        id
        chapters {
          elements {
            id
            number
            startDate
            endDate
            title
            ...pageEditCourseEditChapterModalFragment
          }
        }
        ...pageEditCourseAddChapterModalFragment
      }
    `,
    _course
  );

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      {course.chapters.elements.map((chapter) => (
        <div key={chapter.id} className="border-b">
          <div className="text-lg font-semibold px-4 pt-5 flex justify-between">
            {chapter.number}. {chapter.title}
            <EditChapterModal _chapter={chapter} />
          </div>
          <div className="px-4 text-gray-500 text-xs mb-5">
            {dayjs(chapter.startDate).format("DD.MM.YY")} -{" "}
            {dayjs(chapter.endDate).format("DD.MM.YY")}
          </div>
        </div>
      ))}

      <div className="flex mx-4 justify-end mt-4">
        <Button variant="outlined" endIcon={<Add />} onClick={handleOpenModal}>
          Add Chapter
        </Button>
      </div>

      {openModal && (
        <AddChapterModal open _course={course} onClose={handleCloseModal} />
      )}
    </>
  );
}

function EditChapterModal({
  _chapter,
}: {
  _chapter: pageEditCourseEditChapterModalFragment$key;
}) {
  const [openModal, setOpenModal] = useState(false);

  const chapter = useFragment(
    graphql`
      fragment pageEditCourseEditChapterModalFragment on Chapter {
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
    useMutation<pageEditCourseEditChaptersMutation>(graphql`
      mutation pageEditCourseEditChaptersMutation(
        $chapter: UpdateChapterInput!
      ) {
        updateChapter(input: $chapter) {
          id
          course {
            ...pageEditCourseChaptersFragment
          }
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
  _course: pageEditCourseAddChapterModalFragment$key;
}) {
  const course = useFragment(
    graphql`
      fragment pageEditCourseAddChapterModalFragment on Course {
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
    useMutation<pageEditCourseChaptersMutation>(graphql`
      mutation pageEditCourseChaptersMutation($chapter: CreateChapterInput!) {
        createChapter(input: $chapter) {
          id
          course {
            ...pageEditCourseChaptersFragment
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