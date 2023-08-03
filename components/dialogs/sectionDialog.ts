import * as yup from "yup";
import { SectionOptions } from "../DialogBase";

export type SectionData = {
  name: string;
};

export const dialogSections: SectionOptions<SectionData>[] = [
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

export const validationSchema: yup.ObjectSchema<SectionData> = yup.object({
  name: yup.string().required("Required"),
});
