import * as yup from "yup";
import { SectionOptions } from "../DialogBase";
import { Dayjs } from "dayjs";

export type ChapterData = {
  title: string;
  description: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  suggestedStartDate: Dayjs | null;
  suggestedEndDate: Dayjs | null;
};

export const dialogSections: SectionOptions<ChapterData>[] = [
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
    label: "Start and end",
    fields: [
      {
        key: "startDate",
        label: "Start date",
        type: "date",
        required: true,
        beforeOther: "endDate",
      },
      {
        key: "endDate",
        label: "End date",
        type: "date",
        required: true,
        afterOther: "startDate",
      },
    ],
  },
  {
    label: "Suggested start and end",
    fields: [
      {
        key: "suggestedStartDate",
        label: "Suggested start date",
        type: "date",
        required: true,
        beforeOther: "suggestedEndDate",
        afterOther: "startDate",
      },
      {
        key: "suggestedEndDate",
        label: "Suggested end date",
        type: "date",
        required: true,
        afterOther: "suggestedStartDate",
        beforeOther: "endDate",
      },
    ],
  },
];

// @ts-ignore
export const validationSchema: (
  predecessorStart?: string
) => yup.ObjectSchema<ChapterData> = (predecessorStart) =>
  yup.object({
    title: yup.string().required("Required"),
    description: yup.string().required("Required"),
    startDate:
      predecessorStart != null
        ? yup
            .date()
            .required("Required")
            .min(
              predecessorStart,
              "Chapter can't start before it's predecessor"
            )
        : yup.date().required("Required"),
    endDate: yup.date().required("Required"),
    suggestedStartDate: yup.date().required("Required"),
    suggestedEndDate: yup.date().required("Required"),
  });
