import { Dayjs } from "dayjs";
import * as yup from "yup";
import { SectionOptions } from "../DialogBase";

export type ChapterData = {
  title: string;
  description: string;
  startDate: Dayjs | null;
  suggestedStartDate: Dayjs | null;
  suggestedEndDate: Dayjs | null;
};

export const dialogSections: (
  courseStart: Dayjs,
  courseEnd: Dayjs
) => SectionOptions<ChapterData>[] = (courseStart, courseEnd) => [
  {
    label: "General",
    fields: [
      {
        key: "title",
        label: "Title",
        type: "text",
        required: true,
      },
      {
        key: "description",
        label: "Description",
        type: "text",
        required: false,
        multiline: true,
      },
    ],
  },
  {
    label: "Visible after",
    subtitle: "The chapter will be hidden before this date",
    fields: [
      {
        key: "startDate",
        label: "Start date",
        type: "date",
        required: true,
        minDate: courseStart,
        maxDate: courseEnd,
        defaultMonthDate: courseStart,
      },
    ],
  },
  {
    label: "Suggested start and end",
    subtitle:
      "The recommended time to work on this chapter, displayed to the student",

    fields: [
      {
        key: "suggestedStartDate",
        label: "Suggested start date",
        type: "date",
        required: true,
        beforeOther: "suggestedEndDate",
        afterOther: "startDate",
        minDate: courseStart,
        maxDate: courseEnd,
        defaultMonthDate: courseStart,
      },
      {
        key: "suggestedEndDate",
        label: "Suggested end date",
        type: "date",
        required: true,
        afterOther: "suggestedStartDate",
        minDate: courseStart,
        maxDate: courseEnd,
        defaultMonthDate: courseStart,
      },
    ],
  },
];

export const validationSchema: (
  courseStart: string,
  courseEnd: string
) => yup.ObjectSchema<ChapterData> = (courseStart, courseEnd) =>
  // @ts-ignore
  yup.object({
    title: yup.string().required("Required"),
    description: yup.string().optional(),
    startDate: yup
      .date()
      .required("Required")
      .min(courseStart, "Must be after the course start date")
      .max(courseEnd, "Must be before the course end date"),
    suggestedStartDate: yup
      .date()
      .required("Required")
      .min(yup.ref("startDate"), "Must be after the start date")
      .max(courseEnd, "Must be before the end date"),
    suggestedEndDate: yup
      .date()
      .required("Required")
      .min(
        yup.ref("suggestedStartDate"),
        "Must be after the suggested start date"
      )
      .max(courseEnd, "Must be before the chapter end date"),
  });
