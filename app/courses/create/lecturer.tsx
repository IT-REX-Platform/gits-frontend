"use client";

import { lecturerCreateChapterMutation } from "@/__generated__/lecturerCreateChapterMutation.graphql";
import {
  YearDivision,
  lecturerCreateCourseMutation,
} from "@/__generated__/lecturerCreateCourseMutation.graphql";
import { yearDivisionToString } from "@/components/CourseCard";
import { FormErrors } from "@/components/FormErrors";
import { MultistepForm, StepInfo } from "@/components/MultistepForm";
import {
  Backdrop,
  Box,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TableBody,
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
  const [yearDivision, setYearDivision] =
    useState<YearDivision>("FIRST_SEMESTER");
  const [publish, setPublish] = useState(true);
  const [chapterCount, setChapterCount] = useState(12);

  const handleChange = (event: SelectChangeEvent<String>) => {
    setYearDivision(event.target.value as YearDivision);
  };

  const [createCourse, isCourseInFlight] =
    useMutation<lecturerCreateCourseMutation>(graphql`
      mutation lecturerCreateCourseMutation($course: CreateCourseInput!) {
        createCourse(input: $course) {
          id
          published
          title
          description
          startYear
          ...pageCourseListItemFragment
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
  const [error, setError] = useState<any>(null);

  function handleSubmit() {
    createCourse({
      variables: {
        course: {
          title,
          description,
          startDate: startDate!.toISOString(),
          endDate: endDate!.toISOString(),
          startYear: startDate!.year(),
          yearDivision: yearDivision,
          published: publish,
        },
      },
      updater(store, data) {
        const existingCourses = store
          .getRoot()
          .getLinkedRecord("courses")
          ?.getLinkedRecords("elements");
        const newCourse = store.get(data.createCourse.id);
        if (!existingCourses || !newCourse) return;

        store
          .getRoot()
          .getLinkedRecord("courses")
          ?.setLinkedRecords([...existingCourses, newCourse], "elements");
      },
      onError: setError,
      onCompleted(response) {
        function _addChapter(num: number, dateStart: Dayjs) {
          addChapter({
            variables: {
              chapter: {
                courseId: response.createCourse.id,
                description: "",
                number: num + 1,
                title: `Chapter ${num + 1}`,
                startDate: dateStart.toISOString(),
                endDate: dateStart.add(6, "day").toISOString(),
              },
            },
            onError: setError,
            onCompleted() {
              if (num < chapterCount - 1) {
                _addChapter(num + 1, dateStart.add(7, "day"));
              } else {
                router.push(`/courses/${response.createCourse.id}`);
              }
            },
          });
        }

        _addChapter(0, startDate!);
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
            required
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
            slotProps={{ textField: { required: true } }}
          />
          <DatePicker
            label="End date"
            value={endDate}
            minDate={startDate ?? undefined}
            defaultCalendarMonth={startDate ?? undefined}
            onChange={setEndDate}
            slotProps={{ textField: { required: true } }}
          />
          <Box sx={{ minWidth: 120, maxWidth: 200 }}>
            <FormControl fullWidth>
              <InputLabel>Year Divison</InputLabel>
              <Select
                value={yearDivision}
                onChange={handleChange}
                label={"Year Divison"}
              >
                {(
                  [
                    "FIRST_SEMESTER",
                    "SECOND_SEMESTER",
                    "FIRST_TRIMESTER",
                    "SECOND_TRIMESTER",
                    "THIRD_TRIMESTER",
                    "FIRST_QUARTER",
                    "SECOND_QUARTER",
                    "THIRD_QUARTER",
                    "FOURTH_QUARTER",
                  ] as const
                ).map((x) => (
                  <MenuItem key={x} value={x}>
                    {yearDivisionToString[x]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </>
      ),
      canContinue: startDate != null && endDate != null,
    },
    {
      label: "Confirm",
      content: (
        <>
          <table>
            <TableBody>
              <TableRow label="Title" value={title} />
              <TableRow label="Description" value={description} />
              <TableRow
                label="Start date"
                value={startDate?.format("LL") ?? "-"}
              />
              <TableRow label="End date" value={endDate?.format("LL") ?? "-"} />
            </TableBody>
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
      <FormErrors error={error} onClose={() => setError(null)} />

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
