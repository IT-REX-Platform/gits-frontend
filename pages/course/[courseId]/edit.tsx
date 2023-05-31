import { editCourseAddChapterModalFragment$key } from "@/__generated__/editCourseAddChapterModalFragment.graphql";
import { editCourseChaptersFragment$key } from "@/__generated__/editCourseChaptersFragment.graphql";
import { editCourseChaptersMutation } from "@/__generated__/editCourseChaptersMutation.graphql";
import { editCourseEditChapterModalFragment$key } from "@/__generated__/editCourseEditChapterModalFragment.graphql";
import { editCourseEditChaptersMutation } from "@/__generated__/editCourseEditChaptersMutation.graphql";
import { editCourseGeneralFragment$key } from "@/__generated__/editCourseGeneralFragment.graphql";
import { editCourseMutation } from "@/__generated__/editCourseMutation.graphql";
import { editCourseQuery } from "@/__generated__/editCourseQuery.graphql";
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
import { useRouter } from "next/router";
import { useState } from "react";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

export default function EditCoursePage() {
  const router = useRouter();
  const { coursesById } = useLazyLoadQuery<editCourseQuery>(
    graphql`
      query editCourseQuery($id: [UUID!]!) {
        coursesById(ids: $id) {
          ...editCourseGeneralFragment
          ...editCourseChaptersFragment
        }
      }
    `,
    { id: [router.query.courseId] }
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

function EditGeneral({ _course }: { _course: editCourseGeneralFragment$key }) {
  const course = useFragment(
    graphql`
      fragment editCourseGeneralFragment on Course {
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

  const [updateCourse, isUpdating] = useMutation<editCourseMutation>(graphql`
    mutation editCourseMutation($course: UpdateCourseInput!) {
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
          startDate: startDate!.format("YYYY-MM-DD"),
          endDate: endDate!.format("YYYY-MM-DD"),
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
      {error?.source.errors.map((err: any) => (
        <Alert
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
  _course: editCourseChaptersFragment$key;
}) {
  const course = useFragment(
    graphql`
      fragment editCourseChaptersFragment on Course {
        id
        chapters {
          id
          number
          startDate
          endDate
          title
          ...editCourseEditChapterModalFragment
        }
        ...editCourseAddChapterModalFragment
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
      {course.chapters.map((chapter) => (
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
  _chapter: editCourseEditChapterModalFragment$key;
}) {
  const [openModal, setOpenModal] = useState(false);

  const chapter = useFragment(
    graphql`
      fragment editCourseEditChapterModalFragment on Chapter {
        id
        title
        description
        startDate
        endDate
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
  };

  const [title, setTitle] = useState(chapter.title);
  const [description, setDescription] = useState(chapter.description);
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs(chapter.startDate)
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(chapter.endDate));

  const [error, setError] = useState<any>(null);
  const valid =
    title !== "" &&
    startDate != null &&
    startDate.isValid() &&
    endDate != null &&
    endDate.isValid();

  const [updateChapter, isUpdating] =
    useMutation<editCourseEditChaptersMutation>(graphql`
      mutation editCourseEditChaptersMutation($chapter: UpdateChapterInput!) {
        updateChapter(input: $chapter) {
          id
          course {
            ...editCourseChaptersFragment
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
          startDate: startDate!.format("YYYY-MM-DD"),
          endDate: endDate!.format("YYYY-MM-DD"),
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
          {error?.source.errors.map((err: any) => (
            <Alert severity="error" onClose={() => setError(null)}>
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
  _course: editCourseAddChapterModalFragment$key;
}) {
  const course = useFragment(
    graphql`
      fragment editCourseAddChapterModalFragment on Course {
        id
        chapters {
          id
          number
        }
      }
    `,
    _course
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  const [error, setError] = useState<any>(null);
  const valid =
    title !== "" &&
    startDate != null &&
    startDate.isValid() &&
    endDate != null &&
    endDate.isValid();

  const [addChapter, isUpdating] =
    useMutation<editCourseChaptersMutation>(graphql`
      mutation editCourseChaptersMutation($chapter: CreateChapterInput!) {
        createChapter(input: $chapter) {
          id
          course {
            ...editCourseChaptersFragment
          }
        }
      }
    `);

  function handleSubmit() {
    const nextCourseNumber = course.chapters.length + 1;

    addChapter({
      variables: {
        chapter: {
          courseId: course.id,
          title,
          description,
          startDate: startDate!.format("YYYY-MM-DD"),
          endDate: endDate!.format("YYYY-MM-DD"),
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
          {error?.source.errors.map((err: any) => (
            <Alert severity="error" onClose={() => setError(null)}>
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
