"use client";
import { ContentDocumentFragment$key } from "@/__generated__/ContentDocumentFragment.graphql";
import { ContentFlashcardFragment$key } from "@/__generated__/ContentFlashcardFragment.graphql";
import { ContentInvalidDeleteMutation } from "@/__generated__/ContentInvalidDeleteMutation.graphql";
import { ContentLinkFragment$key } from "@/__generated__/ContentLinkFragment.graphql";
import { ContentMediaFragment$key } from "@/__generated__/ContentMediaFragment.graphql";
import { ContentPresentationFragment$key } from "@/__generated__/ContentPresentationFragment.graphql";
import { ContentQuizFragment$key } from "@/__generated__/ContentQuizFragment.graphql";
import { ContentVideoFragment$key } from "@/__generated__/ContentVideoFragment.graphql";
import { PageView, usePageView } from "@/src/currentView";
import {
  ArrowRight,
  Delete,
  DeleteForever,
  Description,
  Download,
  Language,
  PersonalVideo,
  QuestionAnswerRounded,
  QuestionMark,
  Quiz,
} from "@mui/icons-material";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { MouseEventHandler, ReactElement, ReactNode } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import colors from "tailwindcss/colors";

export function ContentLink({
  disabled = false,
  _content,
}: {
  disabled?: boolean;
  _content: ContentLinkFragment$key;
}) {
  const content = useFragment(
    graphql`
      fragment ContentLinkFragment on Content {
        id
        metadata {
          type
        }
        ...ContentMediaFragment
        ...ContentFlashcardFragment
        ...ContentQuizFragment
      }
    `,
    _content
  );

  switch (content.metadata.type) {
    case "MEDIA":
      return <MediaContent disabled={disabled} _media={content} />;
    case "FLASHCARDS":
      return <FlashcardContent disabled={disabled} _flashcard={content} />;
    case "QUIZ":
      return <QuizContent disabled={disabled} _quiz={content} />;
  }

  return null;
}

export function MediaContent({
  disabled = false,
  recordId,
  replace = false,
  _media,
}: {
  disabled?: boolean;
  recordId?: string;
  replace?: boolean;
  _media: ContentMediaFragment$key;
}) {
  const router = useRouter();
  const { courseId } = useParams();
  const media = useFragment(
    graphql`
      fragment ContentMediaFragment on MediaContent {
        id
        metadata {
          name
          chapterId
        }
        ...ContentVideoFragment
        ...ContentPresentationFragment
        ...ContentDocumentFragment
        mediaRecords {
          id
          type
          name
        }
      }
    `,
    _media
  );

  if (media.mediaRecords.length == 0) {
    return (
      <InvalidContent
        id={media.id}
        chapterId={media.metadata.chapterId}
        type="Invalid content"
        title={media.metadata.name}
        disabled={disabled}
      />
    );
  }

  const record = recordId
    ? media.mediaRecords.find((record) => record.id === recordId)!
    : media.mediaRecords[0];

  function onClick() {
    const path = `/courses/${courseId}/media/${media.id}?recordId=${record.id}`;
    if (replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  }

  let title = recordId ? record.name : media.metadata.name;

  switch (record.type) {
    case "VIDEO":
      return (
        <VideoContent
          title={title}
          disabled={disabled}
          onClick={onClick}
          _media={media}
        />
      );
    case "PRESENTATION":
      return (
        <PresentationContent
          title={title}
          disabled={disabled}
          onClick={onClick}
          _media={media}
        />
      );
    case "DOCUMENT":
      return (
        <DocumentContent
          title={title}
          disabled={disabled}
          onClick={onClick}
          _media={media}
        />
      );
    case "URL":
      return <UrlContent title={title} disabled={disabled} />;
    default:
      return (
        <InvalidContent
          id={media.id}
          chapterId={media.metadata.chapterId}
          type="Unknown content type"
          title={title}
          disabled={disabled}
        />
      );
  }
}

export function VideoContent({
  title,
  disabled = false,
  onClick,
  _media,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  _media: ContentVideoFragment$key;
}) {
  const media = useFragment(
    graphql`
      fragment ContentVideoFragment on MediaContent {
        id
        userProgressData {
          lastLearnDate
        }
      }
    `,
    _media
  );

  return (
    <Content
      type="Video"
      title={title}
      disabled={disabled}
      className="hover:bg-sky-100 rounded-full"
      onClick={onClick}
      icon={
        <ArrowRight
          sx={{
            fontSize: "2.5rem",
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.sky[200]}
          progress={media.userProgressData.lastLearnDate ? 100 : 0}
        />
      }
    />
  );
}

export function DeletedContent() {
  return (
    <Content
      title="Deleted content"
      className="rounded-xl"
      disabled
      icon={
        <DeleteForever
          sx={{
            fontSize: "1.875rem",
            color: "text.disabled",
          }}
        />
      }
      iconFrame={<StaticFrame color="bg-gray-100" />}
    />
  );
}

export function InvalidContent({
  type,
  title,
  disabled = false,
  id,
  chapterId,
}: {
  type: string;
  title: string;
  disabled?: boolean;
  id: string;
  chapterId: string;
}) {
  const [del, deleting] = useMutation<ContentInvalidDeleteMutation>(graphql`
    mutation ContentInvalidDeleteMutation($id: UUID!) {
      deleteContent(id: $id)
    }
  `);

  const [pageView] = usePageView();
  if (pageView === PageView.Student) {
    return null;
  }

  return (
    <Content
      type={type}
      title={title}
      disabled={disabled}
      className="hover:bg-gray-100 rounded-xl"
      action={
        pageView === PageView.Lecturer ? (
          <IconButton
            href="#"
            onClick={(e) => {
              e.stopPropagation();
              if (!deleting) {
                del({
                  variables: { id },
                  updater(store) {
                    const chapter = store.get(chapterId);
                    const contents = chapter?.getLinkedRecords("contents");
                    if (chapter && contents) {
                      chapter.setLinkedRecords(
                        contents.filter((x) => x.getDataID() !== id),
                        "contents"
                      );
                    }
                  },
                });
              }
            }}
          >
            <Delete />
          </IconButton>
        ) : undefined
      }
      icon={
        <QuestionMark
          sx={{
            fontSize: "1.875rem",
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-gray-300"} />
      }
    />
  );
}

export function PresentationContent({
  title,
  disabled = false,
  onClick,
  _media,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  _media: ContentPresentationFragment$key;
}) {
  const media = useFragment(
    graphql`
      fragment ContentPresentationFragment on MediaContent {
        id
        userProgressData {
          lastLearnDate
        }
      }
    `,
    _media
  );

  return (
    <Content
      type="Slides"
      title={title}
      disabled={disabled}
      className="hover:bg-violet-100 rounded-full"
      onClick={onClick}
      icon={
        <PersonalVideo
          sx={{
            fontSize: "1.875rem",
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.violet[200]}
          progress={media.userProgressData.lastLearnDate ? 100 : 0}
        />
      }
    />
  );
}

export function DocumentContent({
  title,
  disabled = false,
  onClick,
  _media,
}: {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  _media: ContentDocumentFragment$key;
}) {
  const media = useFragment(
    graphql`
      fragment ContentDocumentFragment on MediaContent {
        id
        userProgressData {
          lastLearnDate
        }
      }
    `,
    _media
  );

  return (
    <Content
      type="Document"
      title={title}
      disabled={disabled}
      className="hover:bg-indigo-100 rounded-full"
      onClick={onClick}
      icon={
        <Description
          sx={{
            fontSize: "1.875rem",
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.indigo[200]}
          progress={media.userProgressData.lastLearnDate ? 100 : 0}
        />
      }
    />
  );
}

export function UrlContent({
  title,
  disabled = false,
}: {
  title: string;
  disabled?: boolean;
}) {
  return (
    <Content
      type="Url"
      title={title}
      disabled={disabled}
      className="hover:bg-slate-100 rounded-xl"
      icon={
        <Language
          sx={{
            fontSize: "1.875rem",
            color: disabled ? "text.disabled" : "white",
          }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-gray-400"} />
      }
    />
  );
}

export function FlashcardContent({
  _flashcard,
  disabled,
}: {
  _flashcard: ContentFlashcardFragment$key;
  disabled?: boolean;
}) {
  const { courseId } = useParams();
  const flashcard = useFragment(
    graphql`
      fragment ContentFlashcardFragment on FlashcardSetAssessment {
        id
        metadata {
          name
        }
        userProgressData {
          nextLearnDate
        }
      }
    `,
    _flashcard
  );

  const { push } = useRouter();
  return (
    <Content
      type="Flashcards"
      title={flashcard.metadata.name}
      disabled={disabled}
      className="hover:bg-emerald-100 rounded-full"
      onClick={() => push(`/courses/${courseId}/flashcards/${flashcard.id}`)}
      icon={
        <QuestionAnswerRounded
          sx={{
            fontSize: "2rem",
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.emerald[200]}
          progress={disabled ? 0 : 0}
        />
      }
    />
  );
}

export function QuizContent({
  _quiz,
  disabled,
}: {
  _quiz: ContentQuizFragment$key;
  disabled?: boolean;
}) {
  const { courseId } = useParams();
  const quiz = useFragment(
    graphql`
      fragment ContentQuizFragment on QuizAssessment {
        id
        metadata {
          name
        }
        userProgressData {
          nextLearnDate
        }
      }
    `,
    _quiz
  );

  const { push } = useRouter();
  return (
    <Content
      type="Quiz"
      title={quiz.metadata.name}
      disabled={disabled}
      className="hover:bg-emerald-100 rounded-full"
      onClick={() => push(`/courses/${courseId}/quiz/${quiz.id}`)}
      icon={
        <Quiz
          sx={{
            fontSize: "2rem",
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.emerald[200]}
          progress={disabled ? 0 : 0}
        />
      }
    />
  );
}

export function MaterialContent({
  title,
  disabled = false,
  onClick = undefined,
}: {
  title: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <Content
      type="Download"
      title={title}
      disabled={disabled}
      className="hover:bg-amber-100 rounded-xl"
      onClick={onClick}
      icon={
        <Download
          sx={{ color: disabled ? "text.disabled" : "text.secondary" }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-amber-600"} />
      }
    />
  );
}

export function Content({
  type,
  title,
  icon,
  iconFrame,
  disabled = false,
  className = "",
  onClick = undefined,
  action,
}: {
  type?: string;
  title: string;
  icon: ReactElement;
  iconFrame: ReactElement;
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  action?: ReactNode;
}) {
  return (
    <button
      disabled={disabled}
      className={`group flex items-center text-left gap-4 pr-3 hover:disabled:bg-gray-50 ${
        !disabled ? "cursor-pointer" : "cursor-default"
      } ${className}`}
      onClick={onClick}
    >
      <div className="w-16 h-16 relative flex justify-center items-center group-hover:group-enabled:scale-105">
        {iconFrame}
        <div className="absolute">{icon}</div>
      </div>
      <div className="group-hover:group-enabled:translate-x-0.5">
        {type && (
          <Typography
            variant="overline"
            fontWeight={400}
            color={disabled ? "text.disabled" : ""}
          >
            {type}
          </Typography>
        )}
        <Typography
          variant="subtitle1"
          fontSize="1.25rem"
          fontWeight="500"
          color={disabled ? "text.disabled" : ""}
          sx={type ? { marginTop: -1.8, paddingBottom: 0.4 } : undefined}
        >
          {title}
        </Typography>
      </div>
      <div className="flex-1"></div>
      {action}
    </button>
  );
}

export function ProgressFrame({
  color,
  progress,
}: {
  color: string;
  progress: number;
}) {
  return (
    <>
      <div
        className={`absolute w-16 h-16 rounded-full bg-white box-content group-hover:border-4 group-hover:border-white`}
      ></div>
      <CircularProgress
        variant="determinate"
        value={100}
        size="4rem"
        thickness={3}
        sx={{ color: "grey.100" }}
      />
      <CircularProgress
        className="absolute"
        variant="determinate"
        value={progress}
        thickness={3}
        size="4rem"
        sx={{ color }}
      />
      <div
        className={`absolute w-12 h-12 rounded-full`}
        style={{ backgroundColor: color }}
      ></div>
    </>
  );
}

function StaticFrame({ color }: { color?: string }) {
  return <div className={`w-12 h-12 rounded ${color ?? ""}`}></div>;
}
