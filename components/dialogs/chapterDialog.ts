import { SectionOptions } from "../DialogBase";

export type ChapterData = {
  title: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  suggestedStartDate: Date | null;
  suggestedEndDate: Date | null;
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
