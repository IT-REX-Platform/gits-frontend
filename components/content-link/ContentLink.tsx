"use client";

import { ContentLinkFragment$key } from "@/__generated__/ContentLinkFragment.graphql";
import { graphql, useFragment } from "react-relay";
import { QuizContent } from "./QuizContentLink";
import { FlashcardContentLink } from "./FlashcardContentLink";
import { MediaContentLink } from "./MediaContentLink";
import { ContentChip, ContentLinkProps, ContentSize } from "./ContentBase";

export function ContentLink({
  disabled = false,
  optional = false,
  extra_chips = [],
  size = "normal",
  _content,
  courseId,
}: {
  disabled?: boolean;
  optional?: boolean;
  extra_chips?: ContentChip[];
  size?: ContentSize;
  _content: ContentLinkFragment$key;
  courseId: string;
}) {
  const content = useFragment(
    graphql`
      fragment ContentLinkFragment on Content {
        id
        metadata {
          type
        }
        ...MediaContentLinkFragment
        ...FlashcardContentLinkFragment
        ...QuizContentLinkFragment
      }
    `,
    _content
  );

  function getContentNode() {
    switch (content.metadata.type) {
      case "MEDIA":
        return <MediaContentLink courseId={courseId} _media={content} />;
      case "FLASHCARDS":
        return (
          <FlashcardContentLink courseId={courseId} _flashcard={content} />
        );
      case "QUIZ":
        return <QuizContent courseId={courseId} _quiz={content} />;
    }
    return null;
  }

  const chips = [
    ...(optional ? [{ key: "optional", label: "optional" }] : []),
    ...extra_chips,
  ];

  return (
    <ContentLinkProps.Provider value={{ disabled, chips, size }}>
      {getContentNode()}
    </ContentLinkProps.Provider>
  );
}
