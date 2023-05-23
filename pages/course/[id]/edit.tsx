import { editCourseQuery } from "@/__generated__/editCourseQuery.graphql";
import { editCourseMutation } from "@/__generated__/editCourseMutation.graphql";
import { Form, FormActions, FormSection } from "@/components/Form";
import { Heading } from "@/components/Heading";
import {
  Backdrop,
  Button,
  CircularProgress,
  Switch,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import Error from "next/error";
import { useRouter } from "next/router";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

export default function EditCoursePage() {
  const router = useRouter();
  const { coursesById } = useLazyLoadQuery<editCourseQuery>(
    graphql`
      query editCourseQuery($id: [UUID!]!) {
        coursesById(ids: $id) {
          title
          description
          startDate
          endDate
          published
        }
      }
    `,
    { id: [router.query.id] }
  );
  const [updateCourse, isUpdating] = useMutation<editCourseMutation>(graphql`
    mutation editCourseMutation($course: UpdateCourseInput!) {
      updateCourse(input: $course) {
        id
      }
    }
  `);

  // Show 404 error page if id was not found
  if (coursesById.length == 0) {
    return <Error statusCode={404} />;
  }

  const course = coursesById[0];
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs(course.startDate)
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs(course.endDate));
  const [publish, setPublish] = useState(false);

  const valid = title !== "" && startDate != null && endDate != null;

  function handleSubmit() {
    updateCourse({
      variables: {
        course: {
          id: router.query.id,
          title,
          description,
          startDate: startDate!.format("YYYY-MM-DD"),
          endDate: endDate!.format("YYYY-MM-DD"),
          published: publish,
        },
      },
    });
  }

  return (
    <main className="px-10 flex flex-col gap-3">
      <Heading className="mb-5 pl-0 pr-0">Edit course</Heading>

      <Form>
        <FormSection title="Course details">
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
          />
          <DatePicker
            label="End date"
            value={endDate}
            minDate={startDate ?? undefined}
            defaultCalendarMonth={startDate ?? undefined}
            onChange={setEndDate}
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
            Update course
          </Button>
        </FormActions>
      </Form>
      <Backdrop open={isUpdating} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
    </main>
  );
}
