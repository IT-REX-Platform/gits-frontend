import { graphql, useFragment } from "react-relay";

import { SuggestionFragment$key } from "@/__generated__/SuggestionFragment.graphql";
import { ContentLink } from "./content-link/ContentLink";

export function Suggestion({
  _suggestion,
  small = false,
  courseId,
}: {
  _suggestion: SuggestionFragment$key;
  small?: boolean;
  courseId: string;
}) {
  const suggestion = useFragment(
    graphql`
      fragment SuggestionFragment on Suggestion {
        content {
          ...ContentLinkFragment
        }
        type
      }
    `,
    _suggestion
  );

  const extra_chips =
    suggestion.type === "NEW_CONTENT"
      ? [{ key: "new", label: "new" }]
      : suggestion.type === "REPETITION"
      ? [{ key: "repeat", label: "repeat" }]
      : [];

  return (
    <ContentLink
      courseId={courseId}
      _content={suggestion.content}
      extra_chips={extra_chips}
      size={small ? "small" : "normal"}
    />
  );
}
