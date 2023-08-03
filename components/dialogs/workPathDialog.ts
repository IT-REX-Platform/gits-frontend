import * as yup from "yup";
import { SectionOptions } from "../DialogBase";

export type WorkPathData = {
  name: string;
};

export const dialogSections: SectionOptions<WorkPathData>[] = [
  {
    label: "General",
    fields: [
      {
        key: "name",
        label: "Name",
        type: "text",
        required: true,
      },
    ],
  },
];

export const validationSchema: yup.ObjectSchema<WorkPathData> = yup.object({
  name: yup.string().required("Required"),
});
