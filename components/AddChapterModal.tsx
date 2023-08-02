import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import dayjs, { Dayjs } from "dayjs";
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

import { Form, FormSection } from "./Form";
import { AddChapterModalFragment$key } from "@/__generated__/AddChapterModalFragment.graphql";
import { AddChapterModalMutation } from "@/__generated__/AddChapterModalMutation.graphql";

export function AddChapterModal({
  open,
  onClose,
  _course,
}: {
  open: boolean;
  onClose: () => void;
  _course: AddChapterModalFragment$key;
}) {
  const course = useFragment(
    graphql`
      fragment AddChapterModalFragment on Course {
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

  const [addChapter, isUpdating] = useMutation<AddChapterModalMutation>(graphql`
    mutation AddChapterModalMutation($chapter: CreateChapterInput!) {
      createChapter(input: $chapter) {
        id
        course {
          ...AddChapterModalFragment
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
