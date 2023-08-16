import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import * as yup from "yup";

import { AddChapterModalFragment$key } from "@/__generated__/AddChapterModalFragment.graphql";
import { AddChapterModalMutation } from "@/__generated__/AddChapterModalMutation.graphql";
import { max } from "lodash";
import { DialogBase } from "./DialogBase";
import { ChapterData, dialogSections } from "./dialogs/chapterDialog";

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
            endDate
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

  function handleSubmit(values: ChapterData) {
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

  const validationSchema: yup.ObjectSchema<ChapterData> = yup.object({
    title: yup.string().required("Required"),
    description: yup.string().optional().default(""),
    startDate: yup
      .date()
      .min(
        max(course.chapters.elements.map((x) => new Date(x.endDate))),
        "Course can't start before its predecessor"
      )
      .required("Required"),
    endDate: yup.date().required("Required"),
    suggestedStartDate: yup.date().required("Required"),
    suggestedEndDate: yup.date().required("Required"),
  });

  return (
    <DialogBase
      open={open}
      title="Add a chapter"
      sections={dialogSections}
      initialValues={{
        title: "",
        description: "",
        startDate: null,
        endDate: null,
        suggestedStartDate: null,
        suggestedEndDate: null,
      }}
      validationSchema={validationSchema}
      onClose={onClose}
      onSubmit={handleSubmit}
      clearError={() => setError(null)}
      inProgress={isUpdating}
      error={error}
    />
  );
}
