"use client";
import { ContentDocumentFragment$key } from "@/__generated__/ContentDocumentFragment.graphql";
import { ContentFlashcardFragment$key } from "@/__generated__/ContentFlashcardFragment.graphql";
import { ContentInvalidFragment$key } from "@/__generated__/ContentInvalidFragment.graphql";
import { ContentMediaFragment$key } from "@/__generated__/ContentMediaFragment.graphql";
import { ContentPresentationFragment$key } from "@/__generated__/ContentPresentationFragment.graphql";
import { ContentUrlFragment$key } from "@/__generated__/ContentUrlFragment.graphql";
import { ContentVideoFragment$key } from "@/__generated__/ContentVideoFragment.graphql";
import {
  ArrowRight,
  Description,
  Download,
  Language,
  PersonalVideo,
  QuestionAnswerRounded,
  QuestionMark,
} from "@mui/icons-material";
import { CircularProgress, Typography } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { MouseEventHandler, ReactElement } from "react";
import { graphql, useFragment } from "react-relay";
import colors from "tailwindcss/colors";

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
        ...ContentVideoFragment
        ...ContentPresentationFragment
        ...ContentDocumentFragment
        ...ContentUrlFragment
        ...ContentInvalidFragment
        mediaRecords {
          id
          type
        }
      }
    `,
    _media
  );

  if (media.mediaRecords.length == 0) {
    return (
      <InvalidContent
        title="Invalid content"
        disabled={disabled}
        _media={media}
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

  switch (record.type) {
    case "VIDEO":
      return (
        <VideoContent disabled={disabled} onClick={onClick} _media={media} />
      );
    case "PRESENTATION":
      return (
        <PresentationContent
          disabled={disabled}
          onClick={onClick}
          _media={media}
        />
      );
    case "DOCUMENT":
      return (
        <DocumentContent disabled={disabled} onClick={onClick} _media={media} />
      );
    case "URL":
      return <UrlContent disabled={disabled} _media={media} />;
    default:
      return (
        <InvalidContent
          title="Unknown content type"
          disabled={disabled}
          _media={media}
        />
      );
  }
}

export function VideoContent({
  disabled = false,
  onClick,
  _media,
}: {
  disabled?: boolean;
  onClick: () => void;
  _media: ContentVideoFragment$key;
}) {
  const media = useFragment(
    graphql`
      fragment ContentVideoFragment on MediaContent {
        id
        metadata {
          name
        }
        userProgressData {
          nextLearnDate
        }
        mediaRecords {
          id
        }
      }
    `,
    _media
  );

  return (
    <Content
      title="Watch video"
      subtitle={media.metadata.name}
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
          progress={disabled ? 0 : 0}
        />
      }
    />
  );
}

export function InvalidContent({
  title,
  disabled = false,
  _media,
}: {
  title: string;
  disabled?: boolean;
  _media: ContentInvalidFragment$key;
}) {
  const media = useFragment(
    graphql`
      fragment ContentInvalidFragment on MediaContent {
        id
        metadata {
          name
        }
      }
    `,
    _media
  );

  return (
    <Content
      title={title}
      subtitle={media.metadata.name}
      disabled={disabled}
      className="hover:bg-gray-100 rounded-xl"
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
  disabled = false,
  onClick,
  _media,
}: {
  disabled?: boolean;
  onClick: () => void;
  _media: ContentPresentationFragment$key;
}) {
  const media = useFragment(
    graphql`
      fragment ContentPresentationFragment on MediaContent {
        id
        metadata {
          name
        }
        userProgressData {
          nextLearnDate
        }
      }
    `,
    _media
  );

  return (
    <Content
      title="Look at slides"
      subtitle={media.metadata.name}
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
          progress={disabled ? 0 : 0}
        />
      }
    />
  );
}

export function DocumentContent({
  disabled = false,
  onClick,
  _media,
}: {
  disabled?: boolean;
  onClick: () => void;
  _media: ContentDocumentFragment$key;
}) {
  const media = useFragment(
    graphql`
      fragment ContentDocumentFragment on MediaContent {
        id
        metadata {
          name
        }
        userProgressData {
          nextLearnDate
        }
      }
    `,
    _media
  );

  return (
    <Content
      title="Read document"
      subtitle={media.metadata.name}
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
          progress={disabled ? 0 : 0}
        />
      }
    />
  );
}

export function UrlContent({
  disabled = false,
  _media,
}: {
  disabled?: boolean;
  _media: ContentUrlFragment$key;
}) {
  const media = useFragment(
    graphql`
      fragment ContentUrlFragment on MediaContent {
        id
        metadata {
          name
        }
        userProgressData {
          nextLearnDate
        }
      }
    `,
    _media
  );

  return (
    <Content
      title="Open url"
      subtitle={media.metadata.name}
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
      title="Repeat flashcards"
      subtitle={flashcard.metadata.name}
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

export function MaterialContent({
  subtitle,
  disabled = false,
  onClick = undefined,
}: {
  subtitle: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <Content
      title="Download content"
      subtitle={subtitle}
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
  title,
  subtitle,
  icon,
  iconFrame,
  disabled = false,
  className = "",
  onClick = undefined,
}: {
  title: string;
  subtitle: string;
  icon: ReactElement;
  iconFrame: ReactElement;
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  return (
    <button
      disabled={disabled}
      className={`group flex items-center text-left gap-4 pr-12 hover:disabled:bg-gray-50 ${
        !disabled ? "cursor-pointer" : "cursor-default"
      } ${className}`}
      onClick={onClick}
    >
      <div className="w-16 h-16 relative flex justify-center items-center group-hover:group-enabled:scale-105">
        {iconFrame}
        <div className="absolute">{icon}</div>
      </div>
      <div className="group-hover:group-enabled:translate-x-0.5">
        <Typography
          variant="subtitle1"
          fontSize="1.25rem"
          fontWeight="500"
          lineHeight="1.5rem"
          color={disabled ? "text.disabled" : ""}
        >
          {title}
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight={400}
          color={disabled ? "text.disabled" : ""}
        >
          {subtitle}
        </Typography>
      </div>
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
