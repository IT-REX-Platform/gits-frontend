"use client";

import { Typography } from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { ContentLink } from "./Content";
import { OtherContentFragment$key } from "@/__generated__/OtherContentFragment.graphql";

export function OtherContent({
  courseId,
  _chapter,
}: {
  courseId: string;
  _chapter: OtherContentFragment$key;
}) {
  const chapter = useFragment(
    graphql`
      fragment OtherContentFragment on Chapter {
        contentsWithNoSection {
          id
          ...ContentLinkFragment
        }
      }
    `,
    _chapter
  );

  if (chapter.contentsWithNoSection.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 border p-4 rounded border-gray-200 w-fit">
      <Typography variant="subtitle2" className="!mb-4">
        Other content
      </Typography>
      <div className="flex flex-wrap gap-4">
        {chapter.contentsWithNoSection.map((content) => (
          <ContentLink
            courseId={courseId}
            key={content.id}
            _content={content}
          />
        ))}
      </div>
    </div>
  );
}
