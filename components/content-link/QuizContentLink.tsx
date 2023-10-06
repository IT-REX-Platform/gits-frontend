"use client";

import { QuizContentLinkFragment$key } from "@/__generated__/QuizContentLinkFragment.graphql";
import { PageView, usePageView } from "@/src/currentView";
import { Quiz } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";
import { ContentBase } from "./ContentBase";
import { ProgressFrame } from "./ProgressFrame";
import { ContentLinkProps } from "./ContentBase";
import { EarlyRepeatWarnModal } from "./EarlyRepeatWarnModal";

export function QuizContent({
  _quiz,
  courseId,
}: {
  _quiz: QuizContentLinkFragment$key;
  courseId: string;
}) {
  const quiz = useFragment(
    graphql`
      fragment QuizContentLinkFragment on QuizAssessment {
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
    _quiz
  );
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [pageView] = usePageView();
  const { disabled } = useContext(ContentLinkProps);

  const { push } = useRouter();
  const href = `/courses/${courseId}/quiz/${quiz.id}`;

  return (
    <>
      <EarlyRepeatWarnModal
        open={showWarnModal}
        href={href}
        onClose={() => setShowWarnModal(false)}
        _progress={quiz.userProgressData}
      />

      <ContentBase
        type="Quiz"
        title={quiz.metadata.name}
        className="hover:bg-emerald-100"
        color={disabled ? colors.gray[100] : colors.emerald[200]}
        onClick={() => {
          if (
            pageView === PageView.Student &&
            quiz.userProgressData.nextLearnDate &&
            new Date(quiz.userProgressData.nextLearnDate) > new Date()
          ) {
            setShowWarnModal(true);
          } else {
            push(href);
          }
        }}
        icon={
          <Quiz
            className="!w-[47%] !h-[47%]"
            sx={{
              color: disabled ? "text.disabled" : "text.secondary",
            }}
          />
        }
        iconFrame={
          <ProgressFrame
            color={disabled ? colors.gray[100] : colors.emerald[200]}
            _progress={quiz.userProgressData}
          />
        }
      />
    </>
  );
}
