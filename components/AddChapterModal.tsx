import { graphql, useFragment, useMutation } from "react-relay";
import * as yup from "yup";

import { AddChapterModalFragment$key } from "@/__generated__/AddChapterModalFragment.graphql";
import { AddChapterModalMutation } from "@/__generated__/AddChapterModalMutation.graphql";
import { DialogBase } from "./DialogBase";
import { useState } from "react";

export function AddChapterModal({
  open,
  onClose,
  _course,
}: {
  open: boolean;
  onClose: () => void;
  _course: AddChapterModalFragment$key;
}) {
  const course = useFragment(
    graphql`
      fragment AddChapterModalFragment on Course {
        id
        chapters {
          elements {
            id
            title
          }
        }
      }
    `,
    _course
  );

  const [error, setError] = useState<any>(null);

  const [addChapter, isUpdating] = useMutation<AddChapterModalMutation>(graphql`
    mutation AddChapterModalMutation($chapter: CreateChapterInput!) {
      createChapter(input: $chapter) {
        id
        course {
          ...AddChapterModalFragment
        }
      }
    }
  `);

  function handleSubmit(values: {
    title: string;
    description: string;
    startDate: Date | null;
    endDate: Date | null;
    suggestedStartDate: Date | null;
    suggestedEndDate: Date | null;
  }) {
    const nextCourseNumber = course.chapters.elements.length + 1;

    addChapter({
      variables: {
        chapter: {
          courseId: course.id,
          title: values.title,
          description: values.title,
          startDate: values.startDate!.toISOString(),
          endDate: values.endDate!.toISOString(),
          suggestedEndDate: values.suggestedEndDate!.toISOString(),
          suggestedStartDate: values.suggestedStartDate!.toISOString(),
          number: nextCourseNumber,
        },
      },
      onCompleted() {
        onClose();
      },
      onError(error) {
        setError(error);
      },
    });
  }

  return (
    <DialogBase
      open={open}
      title="Add a chapter"
      sections={[
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
      ]}
      initialValues={{
        title: "",
        description: "",
        startDate: null as Date | null,
        endDate: null as Date | null,
        suggestedStartDate: null as Date | null,
        suggestedEndDate: null as Date | null,
      }}
      validationSchema={yup.object({
        title: yup.string().required("Required"),
        description: yup.string().optional().default(""),
        startDate: yup.date().required("Required"),
        endDate: yup.date().required("Required"),
        suggestedStartDate: yup.date().required("Required"),
        suggestedEndDate: yup.date().required("Required"),
      })}
      onClose={onClose}
      onSubmit={handleSubmit}
      clearError={() => setError(null)}
      inProgress={isUpdating}
      error={error}
    />
  );
}
