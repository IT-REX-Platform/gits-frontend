import { useState } from "react";
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

  const [error, setError] = useState<any>(null);
  const predecessorStart = lodash.max(
    course.chapters.elements.map((x) => x.startDate)
  );

  return (
    <DialogBase
      open={open}
      title="Add a chapter"
      sections={dialogSections}
      initialValues={{
        title: "",
        description: "",
        startDate: null,
        endDate: dayjs(course.endDate),
        suggestedStartDate: null,
        suggestedEndDate: dayjs(course.endDate),
      }}
      validationSchema={validationSchema(predecessorStart)}
      onClose={onClose}
      onSubmit={handleSubmit}
      clearError={() => setError(null)}
      inProgress={isUpdating}
      error={error}
    />
  );
}
