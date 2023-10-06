"use client";

import { FlashcardContentLinkFragment$key } from "@/__generated__/FlashcardContentLinkFragment.graphql";
import { PageView, usePageView } from "@/src/currentView";
import { QuestionAnswerRounded } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { ProgressFrame } from "./ProgressFrame";
import { ContentLinkProps } from "./ContentBase";
import { EarlyRepeatWarnModal } from "./EarlyRepeatWarnModal";

export function FlashcardContentLink({
  _flashcard,
  courseId,
}: {
  _flashcard: FlashcardContentLinkFragment$key;
  courseId: string;
}) {
  const flashcard = useFragment(
    graphql`
      fragment FlashcardContentLinkFragment on FlashcardSetAssessment {
        id
        metadata {
          name
        }

        userProgressData {
          nextLearnDate
          ...EarlyRepeatWarnModalFragment
          ...ProgressFrameFragment
        }
      }
    `,
    _flashcard
  );

  const [showWarnModal, setShowWarnModal] = useState(false);
  const { disabled } = useContext(ContentLinkProps);

  const [pageView] = usePageView();

  const { push } = useRouter();
  const href = `/courses/${courseId}/flashcards/${flashcard.id}`;
  return (
    <>
      <EarlyRepeatWarnModal
        open={showWarnModal}
        href={href}
        onClose={() => setShowWarnModal(false)}
        _progress={flashcard.userProgressData}
      />
      <ContentBase
        type="Flashcards"
        title={flashcard.metadata.name}
        className="hover:bg-emerald-100"
        color={disabled ? colors.gray[100] : colors.emerald[200]}
        onClick={() => {
          if (
            pageView === PageView.Student &&
            flashcard.userProgressData.nextLearnDate &&
            new Date(flashcard.userProgressData.nextLearnDate) > new Date()
          ) {
            setShowWarnModal(true);
          } else {
            push(href);
          }
        }}
        icon={
          <QuestionAnswerRounded
            className="!w-1/2 !h-1/2"
            sx={{
              color: disabled ? "text.disabled" : "text.secondary",
            }}
          />
        }
        iconFrame={
          <ProgressFrame
            color={disabled ? colors.gray[100] : colors.emerald[200]}
            _progress={flashcard.userProgressData}
          />
        }
      />
    </>
  );
}
