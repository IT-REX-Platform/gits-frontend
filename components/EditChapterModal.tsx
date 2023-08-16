import { Edit } from "@mui/icons-material";
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
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

import { EditChapterModalFragment$key } from "@/__generated__/EditChapterModalFragment.graphql";
import { EditChapterModalMutation } from "@/__generated__/EditChapterModalMutation.graphql";
import { Form, FormSection } from "./Form";

export function EditChapterModal({
  _chapter,
}: {
  _chapter: EditChapterModalFragment$key;
}) {
  const [openModal, setOpenModal] = useState(false);

  const chapter = useFragment(
    graphql`
      fragment EditChapterModalFragment on Chapter {
        id
        title
        description
        startDate
        endDate
        suggestedStartDate
        suggestedEndDate
        course {
          id
          chapters(sortBy: [], sortDirection: []) {
            elements {
              id
              number
              startDate
              endDate
            }
          }
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

  const startDateValid =
    startDate &&
    chapter.course.chapters.elements
      .filter((x) => x.number < chapter.number)
      .every((x) => new Date(x.endDate) < startDate.toDate());

  const endDateValid =
    endDate &&
    chapter.course.chapters.elements
      .filter((x) => x.number > chapter.number)
      .every((x) => new Date(x.startDate) > endDate.toDate());

  const valid =
    title !== "" &&
    startDate != null &&
    startDate.isValid() &&
    endDate != null &&
    endDate.isValid() &&
    startDateValid &&
    endDateValid;

  const [updateChapter, isUpdating] =
    useMutation<EditChapterModalMutation>(graphql`
      mutation EditChapterModalMutation($chapter: UpdateChapterInput!) {
        updateChapter(input: $chapter) {
          id
          ...EditChapterModalFragment
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
                    helperText: !startDateValid
                      ? "Chapter can't start before it's predecessor ended"
                      : "",
                    error:
                      startDate == null ||
                      !startDate.isValid() ||
                      !startDateValid,
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
                    helperText: !startDateValid
                      ? "Chapter can't end after it's predecessor started"
                      : "",

                    required: true,
                    error:
                      endDate == null || !endDate.isValid() || !endDateValid,
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
