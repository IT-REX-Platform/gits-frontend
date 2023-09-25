"use client";

import { lecturerCreateChapterMutation } from "@/__generated__/lecturerCreateChapterMutation.graphql";
import {
  YearDivision,
  lecturerCreateCourseMutation,
} from "@/__generated__/lecturerCreateCourseMutation.graphql";
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
  const [yearDivision, setYearDivision] = useState<YearDivision>(
    "" ||
      "FIRST_SEMESTER" ||
      "SECOND_SEMESTER" ||
      "FIRST_TRIMESTER" ||
      "SECOND_TRIMESTER" ||
      "THIRD_TRIMESTER" ||
      "FIRST_QUARTER" ||
      "SECOND_QUARTER" ||
      "THIRD_QUARTER" ||
      "FOURTH_QUARTER"
  );
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
          <Box sx={{ minWidth: 120, maxWidth: 200 }}>
            <FormControl fullWidth>
              <InputLabel>Year Divison</InputLabel>
              <Select
                value={yearDivision}
                onChange={handleChange}
                label={"Year Divison"}
              >
                <MenuItem value={"FIRST_SEMESTER"}>Winter semester</MenuItem>
                <MenuItem value={"SECOND_SEMESTER"}>Summer semester</MenuItem>
                <MenuItem value={"FIRST_TRIMESTER"}>1st Trimester</MenuItem>
                <MenuItem value={"SECOND_TRIMESTER"}>2nd Trimester</MenuItem>
                <MenuItem value={"THIRD_TRIMESTER"}>3rd Trimester</MenuItem>
                <MenuItem value={"FIRST_QUARTER"}>1st Quarter</MenuItem>
                <MenuItem value={"SECOND_QUARTER"}>2nd Quarter</MenuItem>
                <MenuItem value={"THIRD_QUARTER"}>3rd Quarter</MenuItem>
                <MenuItem value={"FOURTH_QUARTER"}>4th Quarter</MenuItem>
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
