import { ContentTags$key } from "@/__generated__/ContentTags.graphql";
import { Chip } from "@mui/material";
import { graphql, useFragment } from "react-relay";

export function ContentTags({ metadata }: { metadata: ContentTags$key }) {
  const { tagNames } = useFragment(
    graphql`
      fragment ContentTags on ContentMetadata {
        tagNames
      }
    `,
    metadata
  );

  return (
    <div className="flex gap-2 my-1">
      {tagNames.map((tag, i) => (
        <Chip label={tag} key={i} variant="outlined" />
      ))}
    </div>
  );
}
