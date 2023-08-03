import * as yup from "yup";
import { useFormik } from "formik";
import { TextField } from "@mui/material";

import { Form, FormSection } from "./Form";

export type WorkPathFormValues = {
  name: string;
};

export function WorkPathForm({
  initialValues,
  validationSchema,
}: {
  initialValues?: WorkPathFormValues;
  validationSchema: yup.ObjectSchema<{ name: string }>;
}) {
  const formik = useFormik<WorkPathFormValues>({
    initialValues: initialValues ?? {
      name: "",
    },
    validationSchema,
    onSubmit(values) {
      console.log(values);
    },
  });

  return (
    <Form>
      <FormSection title="General">
        <TextField
          className="w-96"
          label="Name"
          variant="outlined"
          value={formik.values.name}
          onChange={formik.handleChange}
          error={formik.touched.name && !!formik.errors.name}
          helperText={formik.touched.name && formik.errors.name}
          required
        />
      </FormSection>
    </Form>
  );
}
