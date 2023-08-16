"use client";

import { lecturerCreateChapterMutation } from "@/__generated__/lecturerCreateChapterMutation.graphql";
import { lecturerCreateCourseMutation } from "@/__generated__/lecturerCreateCourseMutation.graphql";
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
  const [chapterCount, setChapterCount] = useState(12);

  const [createCourse, isCourseInFlight] =
    useMutation<lecturerCreateCourseMutation>(graphql`
      mutation lecturerCreateCourseMutation($course: CreateCourseInput!) {
        createCourse(input: $course) {
          id
        }
      }
    `);

  const [addChapter, isUpdating] =
    useMutation<lecturerCreateChapterMutation>(graphql`
      mutation lecturerCreateChapterMutation($chapter: CreateChapterInput!) {
        createChapter(input: $chapter) {
          id
          course {
            ...AddChapterModalFragment
          }
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
      onCompleted(response) {
        function _addChapter(num: number) {
          addChapter({
            variables: {
              chapter: {
                courseId: response.createCourse.id,
                description: "",
                number: num + 1,
                title: `Chapter ${num + 1}`,
                startDate: startDate!.toISOString(),
                endDate: endDate!.toISOString(),
              },
            },
            onCompleted() {
              if (num < chapterCount - 1) {
                _addChapter(num + 1);
              } else {
                router.push(`/courses/${response.createCourse.id}`);
              }
            },
          });
        }

        _addChapter(0);
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
          />{" "}
          <TextField
            className="w-80 lg:w-96"
            label="Number of chapters"
            variant="outlined"
            type="number"
            value={chapterCount}
            onChange={(e) => setChapterCount(Number(e.target.value) ?? 1)}
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
