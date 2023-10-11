import { Edit } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";

import { EditChapterButtonMutation } from "@/__generated__/EditChapterButtonMutation.graphql";
import { EditChapterButtonDeleteMutation } from "@/__generated__/EditChapterButtonDeleteMutation.graphql";
import { EditChapterButtonFragment$key } from "@/__generated__/EditChapterButtonFragment.graphql";
import { DialogBase } from "./DialogBase";
import { dialogSections, validationSchema } from "./dialogs/chapterDialog";

export default function EditChapterButton({
  courseId,
  _chapter,
}: {
  courseId: string;
  _chapter: EditChapterButtonFragment$key;
}) {
  const [open, setOpen] = useState(false);
  const chapter = useFragment(
    graphql`
      fragment EditChapterButtonFragment on Chapter {
        id
        title
        description
        startDate
        suggestedStartDate
        suggestedEndDate
        course {
          id
          startDate
          endDate
        }
        number
      }
    `,
    _chapter
  );
  const [editSection] = useMutation<EditChapterButtonMutation>(graphql`
    mutation EditChapterButtonMutation($chapter: UpdateChapterInput!) {
      updateChapter(input: $chapter) {
        id
        ...EditChapterButtonFragment
      }
    }
  `);
  const [deleteChapter] = useMutation<EditChapterButtonDeleteMutation>(
    graphql`
      mutation EditChapterButtonDeleteMutation($id: UUID!) {
        deleteChapter(id: $id)
      }
    `
  );

  const [error, setError] = useState<any>(null);
  const sections = useMemo(
    () =>
      dialogSections(
        dayjs(chapter.course.startDate),
        dayjs(chapter.course.endDate)
      ),
    [chapter.course]
  );
  const schema = useMemo(
    () => validationSchema(chapter.course.startDate, chapter.course.endDate),
    [chapter.course]
  );

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <Edit fontSize="small" />
      </IconButton>
      <DialogBase
        open={open}
        title="Edit chapter"
        sections={sections}
        onSubmit={(data) =>
          editSection({
            variables: {
              chapter: {
                id: chapter.id,
                title: data.title,
                description: data.description,
                startDate: data.startDate!.toISOString(),
                endDate: chapter.course.endDate,
                suggestedStartDate: data.suggestedStartDate!.toISOString(),
                suggestedEndDate: data.suggestedEndDate!.toISOString(),
                number: chapter.number,
              },
            },
            onCompleted() {
              setOpen(false);
            },
            onError: setError,
          })
        }
        onDelete={() => {
          deleteChapter({
            variables: { id: chapter.id },
            onCompleted: () => setOpen(false),
            onError: setError,
            updater(store) {
              const root = store.get(courseId)?.getLinkedRecord("chapters");
              if (!root) return;

              const sections = root?.getLinkedRecords("elements") ?? [];
              root.setLinkedRecords(
                sections.filter((x) => x.getDataID() !== chapter.id),
                "elements"
              );
            },
          });
        }}
        initialValues={{
          ...chapter,
          startDate: dayjs(chapter.startDate),
          suggestedStartDate: dayjs(chapter.suggestedStartDate),
          suggestedEndDate: dayjs(chapter.suggestedEndDate),
        }}
        validationSchema={schema}
        onClose={() => setOpen(false)}
        error={error}
      />
    </>
  );
}
