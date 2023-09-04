import { graphql, useFragment } from "react-relay";
import { Chip } from "@mui/material";

import { ContentLink } from "./Content";
import { SuggestionFragment$key } from "@/__generated__/SuggestionFragment.graphql";

export function Suggestion({
  _suggestion,
}: {
  _suggestion: SuggestionFragment$key;
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

  return (
    <ContentLink
      _content={suggestion.content}
      extra_chips={[
        suggestion.type === "NEW_CONTENT" ? (
          <Chip key="new" className="!h-5 !text-xs" label="new" />
        ) : suggestion.type === "REPETITION" ? (
          <Chip key="repeat" className="!h-5 !text-xs" label="repeat" />
        ) : undefined,
      ]}
    />
  );
}
