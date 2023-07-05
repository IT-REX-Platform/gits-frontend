"use client";

import { pageCreateCourseMutation } from "@/__generated__/pageCreateCourseMutation.graphql";
import { MultistepForm, StepInfo } from "@/components/MultistepForm";
import {
  Backdrop,
  CircularProgress,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";

function TableRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th className="text-left align-top pr-4">{label}:</th>
      <td className="w-96">{value}</td>
    </tr>
  );
}

export default function NewCourse() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [publish, setPublish] = useState(false);

  const [createCourse, isCourseInFlight] =
    useMutation<pageCreateCourseMutation>(graphql`
      mutation pageCreateCourseMutation($course: CreateCourseInput!) {
        createCourse(input: $course) {
          id
        }
      }
    `);

  function handleSubmit() {
    createCourse({
      variables: {
        course: {
          title,
          description,
          startDate: startDate!.toISOString(),
          endDate: endDate!.toISOString(),
          published: publish,
        },
      },
      onCompleted(response, errors) {
        router.push(`/course/${response.createCourse.id}`);
      },
    });
  }

  const steps: StepInfo[] = [
    {
      label: "Course details",
      content: (
        <>
          <TextField
            className="w-80 lg:w-96"
            label="Title"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            className="w-80 lg:w-96"
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
          />
        </>
      ),
      canContinue: title !== "",
    },
    {
      label: "Start and end",
      content: (
        <>
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
        </>
      ),
      canContinue: startDate != null && endDate != null,
    },
    {
      label: "Confirm",
      content: (
        <>
          <table>
            <TableRow label="Title" value={title} />
            <TableRow label="Description" value={description} />
            <TableRow
              label="Start date"
              value={startDate?.format("LL") ?? "-"}
            />
            <TableRow label="End date" value={endDate?.format("LL") ?? "-"} />
          </table>
          <FormControlLabel
            label="Publish course"
            control={
              <Switch
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
              />
            }
          />
        </>
      ),
      canContinue: true,
    },
  ];

  return (
    <main className="flex flex-col gap-3">
      <Typography variant="h1" gutterBottom>
        Create new course
      </Typography>
      <MultistepForm
        submitLabel="Create course"
        steps={steps}
        onSubmit={handleSubmit}
      />
      <Backdrop open={isCourseInFlight} sx={{ zIndex: "modal" }}>
        <CircularProgress />
      </Backdrop>
    </main>
  );
}
