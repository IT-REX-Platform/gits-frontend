import { useMemo, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

import { AddChapterModalFragment$key } from "@/__generated__/AddChapterModalFragment.graphql";
import { AddChapterModalMutation } from "@/__generated__/AddChapterModalMutation.graphql";
import dayjs from "dayjs";
import lodash from "lodash";
import { DialogBase } from "./DialogBase";
import {
  ChapterData,
  dialogSections,
  validationSchema,
} from "./dialogs/chapterDialog";

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
        startDate
        endDate
        chapters {
          elements {
            id
            title
            startDate
          }
        }
      }
    `,
    _course
  );

  const [addChapter, isUpdating] = useMutation<AddChapterModalMutation>(graphql`
    mutation AddChapterModalMutation($chapter: CreateChapterInput!) {
      createChapter(input: $chapter) {
        id
        course {
          ...AddChapterModalFragment
          ...lecturerCourseFragment
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
          description: values.description,
          startDate: values.startDate!.toISOString(),
          endDate: course.endDate,
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

  const [error, setError] = useState<any>(null);
  const sections = useMemo(
    () => dialogSections(dayjs(course.startDate), dayjs(course.endDate)),
    [course]
  );
  const schema = useMemo(
    () => validationSchema(course.startDate, course.endDate),
    [course]
  );

  return (
    <DialogBase
      open={open}
      title="Add a chapter"
      sections={sections}
      initialValues={{
        title: "",
        description: "",
        startDate: null,
        suggestedStartDate: null,
        suggestedEndDate: null,
      }}
      validationSchema={schema}
      onClose={onClose}
      onSubmit={handleSubmit}
      clearError={() => setError(null)}
      inProgress={isUpdating}
      error={error}
    />
  );
}
