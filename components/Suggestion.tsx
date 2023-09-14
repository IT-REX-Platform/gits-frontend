import { graphql, useFragment } from "react-relay";
import { Chip } from "@mui/material";

import { ContentLink } from "./Content";
import { SuggestionFragment$key } from "@/__generated__/SuggestionFragment.graphql";

export function Suggestion({
  _suggestion,
  small = false,
}: {
  _suggestion: SuggestionFragment$key;
  small?: boolean;
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
      _content={suggestion.content}
      extra_chips={extra_chips}
      size={small ? "small" : "normal"}
    />
  );
}
