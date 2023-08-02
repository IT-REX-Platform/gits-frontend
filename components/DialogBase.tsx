import { ObjectSchema } from "yup";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { FormErrors } from "./FormErrors";
import { Form, FormSection } from "./Form";
import { FormikProps, useFormik } from "formik";

export type FieldType = "text" | "date";
export type FieldOptions<T extends object> = {
  key: keyof T;
  label: string;
  type: FieldType;
  required: boolean;
};
export type SectionOptions<T extends object> = {
  label: string;
  fields: FieldOptions<T>[];
};

export function DialogBase<T extends { [k in string]: any }>({
  title,
  open,
  error,
  inProgress = false,
  sections,
  initialValues,
  validationSchema,
  onSubmit = () => {},
  onClose = () => {},
  clearError = () => {},
}: {
  title: string;
  open: boolean;
  error?: any;
  inProgress?: boolean;
  sections: SectionOptions<T>[];
  initialValues: T;
  validationSchema: ObjectSchema<T>;
  onSubmit?: (values: T) => void;
  onClose?: () => void;
  clearError?: () => void;
}) {
  const formik = useFormik<T>({
    initialValues,
    validationSchema,
    validateOnMount: true,
    onSubmit,
  });

  return (
    <Dialog open={open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent className="relative">
        <FormErrors error={error} onClose={clearError} />
        <Form>
          {sections.map((section) => (
            <FormSection key={section.label} title={section.label}>
              {section.fields.map((field) => (
                <Field
                  formik={formik}
                  key={field.key as string}
                  field={field}
                />
              ))}
            </FormSection>
          ))}
        </Form>
        {inProgress && (
          <div className="absolute inset-0 bg-white z-10 flex justify-center items-center">
            <CircularProgress />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={inProgress} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!formik.isValid || inProgress}
          onClick={() => onSubmit(formik.values)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Field<T extends object>({
  formik,
  field,
}: {
  formik: FormikProps<T>;
  field: FieldOptions<T>;
}) {
  switch (field.type) {
    case "text":
      return (
        <TextField
          id={field.key as string}
          label={field.label}
          value={formik.values[field.key]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched[field.key] && !!formik.errors[field.key]}
          helperText={
            formik.touched[field.key] && (formik.errors[field.key] as string)
          }
          required={field.required}
        />
      );
    case "date":
      return <div></div>;
  }
}
