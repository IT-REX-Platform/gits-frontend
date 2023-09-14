import { DeleteQuizButtonMutation } from "@/__generated__/DeleteQuizButtonMutation.graphql";
import { Delete } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { graphql, useMutation } from "react-relay";

export function DeleteQuizButton({
  chapterId,
  contentId,
  onError,
  onCompleted,
}: {
  chapterId: string;
  contentId: string;
  onError: (e: any) => void;
  onCompleted: () => void;
}) {
  const [deleteQuiz, deleting] = useMutation<DeleteQuizButtonMutation>(graphql`
    mutation DeleteQuizButtonMutation($id: UUID!) {
      mutateContent(contentId: $id) {
        deleteContent
      }
    }
  `);

  return (
    <Button
      sx={{ color: "text.secondary" }}
      startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
      onClick={() => {
        if (
          confirm(
            "Do you really want to delete this quiz? This can't be undone."
          )
        ) {
          deleteQuiz({
            variables: { id: contentId },
            onCompleted,
            onError,
            updater(store) {
              const chapter = store.get(chapterId);
              const contents = chapter?.getLinkedRecords("contents");
              if (chapter && contents) {
                chapter.setLinkedRecords(
                  contents.filter((x) => x.getDataID() !== contentId),
                  "contents"
                );
              }
            },
          });
        }
      }}
    >
      Delete
    </Button>
  );
}
