"use client";
import { ContentDocumentFragment$key } from "@/__generated__/ContentDocumentFragment.graphql";
import { ContentEarlyRepeatFragment$key } from "@/__generated__/ContentEarlyRepeatFragment.graphql";
import { ContentFlashcardFragment$key } from "@/__generated__/ContentFlashcardFragment.graphql";
import { ContentInvalidDeleteMutation } from "@/__generated__/ContentInvalidDeleteMutation.graphql";
import { ContentLinkFragment$key } from "@/__generated__/ContentLinkFragment.graphql";
import { ContentMediaFragment$key } from "@/__generated__/ContentMediaFragment.graphql";
import { ContentPresentationFragment$key } from "@/__generated__/ContentPresentationFragment.graphql";
import { ContentProgressFrameFragment$key } from "@/__generated__/ContentProgressFrameFragment.graphql";
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
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useState,
} from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import colors from "tailwindcss/colors";

export type ContentSize = "small" | "normal";
export type ContentChip = {
  key: string;
  label: string;
  color?: string;
};

const ContentLinkProps = createContext({
  disabled: false,
  chips: [] as ContentChip[],
  size: "normal" as ContentSize,
});

export function ContentLink({
  disabled = false,
  optional = false,
  extra_chips = [],
  size = "normal",
  _content,
}: {
  disabled?: boolean;
  optional?: boolean;
  extra_chips?: ContentChip[];
  size?: ContentSize;
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

  function getContentNode() {
    switch (content.metadata.type) {
      case "MEDIA":
        return <MediaContent _media={content} />;
      case "FLASHCARDS":
        return <FlashcardContent _flashcard={content} />;
      case "QUIZ":
        return <QuizContent _quiz={content} />;
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

export function MediaContent({
  recordId,
  replace = false,
  _media,
}: {
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
      return <VideoContent title={title} onClick={onClick} _media={media} />;
    case "PRESENTATION":
      return (
        <PresentationContent title={title} onClick={onClick} _media={media} />
      );
    case "DOCUMENT":
      return <DocumentContent title={title} onClick={onClick} _media={media} />;
    case "URL":
      return <UrlContent title={title} />;
    default:
      return (
        <InvalidContent
          id={media.id}
          chapterId={media.metadata.chapterId}
          type="Unknown content type"
          title={title}
        />
      );
  }
}

export function VideoContent({
  title,
  onClick,
  _media,
}: {
  title: string;
  onClick: () => void;
  _media: ContentVideoFragment$key;
}) {
  const { disabled } = useContext(ContentLinkProps);
  const media = useFragment(
    graphql`
      fragment ContentVideoFragment on MediaContent {
        id
        userProgressData {
          ...ContentProgressFrameFragment
        }
      }
    `,
    _media
  );

  return (
    <Content
      type="Video"
      title={title}
      className="hover:bg-sky-100"
      color={disabled ? colors.gray[100] : colors.sky[200]}
      onClick={onClick}
      icon={
        <ArrowRight
          className="!w-3/4 !h-3/4"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.sky[200]}
          _progress={media.userProgressData}
        />
      }
    />
  );
}

export function DeletedContent({ size = "normal" }: { size?: ContentSize }) {
  return (
    <ContentLinkProps.Provider value={{ disabled: true, chips: [], size }}>
      <Content
        title="Deleted content"
        className="!bg-transparent"
        color={colors.gray[100]}
        icon={
          <DeleteForever
            className="!w-1/2 !h-1/2"
            sx={{
              color: "text.disabled",
            }}
          />
        }
        iconFrame={<StaticFrame color="bg-gray-100" />}
        square
      />
    </ContentLinkProps.Provider>
  );
}

export function InvalidContent({
  type,
  title,
  id,
  chapterId,
}: {
  type: string;
  title: string;
  id: string;
  chapterId: string;
}) {
  const { disabled } = useContext(ContentLinkProps);
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
      className="hover:bg-gray-100"
      color={disabled ? colors.gray[100] : colors.gray[300]}
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
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-gray-300"} />
      }
      square
    />
  );
}

export function PresentationContent({
  title,
  onClick,
  _media,
}: {
  title: string;
  onClick: () => void;
  _media: ContentPresentationFragment$key;
}) {
  const { disabled } = useContext(ContentLinkProps);
  const media = useFragment(
    graphql`
      fragment ContentPresentationFragment on MediaContent {
        id
        userProgressData {
          ...ContentProgressFrameFragment
        }
      }
    `,
    _media
  );

  return (
    <Content
      type="Slides"
      title={title}
      className="hover:bg-violet-100"
      color={disabled ? colors.gray[100] : colors.violet[200]}
      onClick={onClick}
      icon={
        <PersonalVideo
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.violet[200]}
          _progress={media.userProgressData}
        />
      }
    />
  );
}

export function DocumentContent({
  title,
  onClick,
  _media,
}: {
  title: string;
  onClick: () => void;
  _media: ContentDocumentFragment$key;
}) {
  const { disabled } = useContext(ContentLinkProps);
  const media = useFragment(
    graphql`
      fragment ContentDocumentFragment on MediaContent {
        id
        userProgressData {
          ...ContentProgressFrameFragment
        }
      }
    `,
    _media
  );

  return (
    <Content
      type="Document"
      title={title}
      className="hover:bg-indigo-100"
      color={disabled ? colors.gray[100] : colors.indigo[200]}
      onClick={onClick}
      icon={
        <Description
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "text.secondary",
          }}
        />
      }
      iconFrame={
        <ProgressFrame
          color={disabled ? colors.gray[100] : colors.indigo[200]}
          _progress={media.userProgressData}
        />
      }
    />
  );
}

export function UrlContent({ title }: { title: string }) {
  const { disabled } = useContext(ContentLinkProps);
  return (
    <Content
      type="Url"
      title={title}
      className="hover:bg-slate-100"
      color={disabled ? colors.gray[100] : colors.gray[400]}
      icon={
        <Language
          className="!w-1/2 !h-1/2"
          sx={{
            color: disabled ? "text.disabled" : "white",
          }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-gray-400"} />
      }
      square
    />
  );
}

function EarlyRepeatWarnModal({
  _progress,
  href,
  onClose,
  ...props
}: {
  _progress: ContentEarlyRepeatFragment$key;
  href: string;
  onClose: () => void;
} & DialogProps) {
  const { lastLearnDate, nextLearnDate } = useFragment(
    graphql`
      fragment ContentEarlyRepeatFragment on UserProgressData {
        nextLearnDate
        lastLearnDate
        contentId
      }
    `,
    _progress
  );
  const { push } = useRouter();

  const diffLastLearn = Math.abs(
    Math.floor(dayjs(lastLearnDate).diff(new Date(), "days"))
  );

  return (
    <Dialog maxWidth="xs" {...props}>
      <DialogTitle>You&apos;re a little early</DialogTitle>
      <DialogContent>
        You&apos;ve just learned this{" "}
        {diffLastLearn === 0
          ? "today"
          : `${diffLastLearn} day${diffLastLearn > 1 ? "s" : ""}`}{" "}
        ago. You won&apos;t earn any new reward points before{" "}
        {new Date(nextLearnDate).toLocaleDateString("en-EN")}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => push(href)} color="error">
          Learn anyway
        </Button>
        <Button onClick={onClose} color="primary">
          Go back
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function FlashcardContent({
  _flashcard,
}: {
  _flashcard: ContentFlashcardFragment$key;
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
          ...ContentEarlyRepeatFragment
          ...ContentProgressFrameFragment
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
      <Content
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

export function QuizContent({ _quiz }: { _quiz: ContentQuizFragment$key }) {
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
          ...ContentEarlyRepeatFragment
          ...ContentProgressFrameFragment
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

      <Content
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

export function MaterialContent({
  title,
  onClick = undefined,
}: {
  title: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}) {
  const { disabled } = useContext(ContentLinkProps);
  return (
    <Content
      type="Download"
      title={title}
      className="hover:bg-amber-100"
      color={disabled ? colors.gray[100] : colors.amber[600]}
      onClick={onClick}
      icon={
        <Download
          sx={{ color: disabled ? "text.disabled" : "text.secondary" }}
        />
      }
      iconFrame={
        <StaticFrame color={disabled ? "bg-gray-100" : "bg-amber-600"} />
      }
      square
    />
  );
}

export function Content({
  type,
  title,
  icon,
  color,
  iconFrame,
  className = "",
  onClick = undefined,
  action,
  square = false,
}: {
  type?: string;
  title: string;
  icon: ReactElement;
  color?: string;
  iconFrame: ReactElement;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  action?: ReactNode;
  square?: boolean;
}) {
  const { disabled, chips, size } = useContext(ContentLinkProps);
  const chips_ = [
    ...(type ? [{ key: "type", label: type, color }] : []),
    ...chips,
  ];

  const gap = size == "small" ? "gap-2" : "gap-4";
  const rounding = !square
    ? "rounded-full"
    : size == "small"
    ? "rounded"
    : "rounded-xl";
  const cursor = !disabled ? "cursor-pointer" : "cursor-default";
  const frameSize = size == "small" ? "w-10 h-10" : "w-16 h-16";

  return (
    <button
      disabled={disabled}
      className={`group flex items-center text-left ${gap} pr-3 hover:disabled:bg-gray-50 ${cursor} ${rounding} ${className}`}
      onClick={onClick}
    >
      <div
        className={`${frameSize} relative flex justify-center items-center group-hover:group-enabled:scale-105`}
      >
        {iconFrame}
        <div className="absolute flex justify-center">{icon}</div>
      </div>
      <div className="group-hover:group-enabled:translate-x-0.5">
        <div
          className={`flex items-center ${
            size == "small" ? "gap-1 -ml-0.5" : "gap-1.5 -ml-1"
          }`}
        >
          {chips_.map((chip) => (
            <Chip
              key={chip.key}
              className={
                size == "small" ? "!h-3.5 !text-[0.6rem]" : "!h-5 text-xs"
              }
              label={chip.label}
              sx={{ backgroundColor: chip.color }}
              classes={{ label: size == "small" ? "!px-2 mt-[0.1rem]" : "" }}
            />
          ))}
        </div>
        <Typography
          variant="subtitle1"
          fontSize={size == "small" ? "0.8rem" : "1.25rem"}
          fontWeight="500"
          color={disabled ? "text.disabled" : ""}
          sx={size == "small" ? { lineHeight: 1.5 } : { marginBottom: -0.5 }}
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
  _progress,
}: {
  color: string;
  _progress: ContentProgressFrameFragment$key;
}) {
  const progress = useFragment(
    graphql`
      fragment ContentProgressFrameFragment on UserProgressData {
        isLearned
      }
    `,
    _progress
  );
  return (
    <>
      <div
        className={`absolute w-full h-full rounded-full bg-white box-content group-hover:border-4 group-hover:border-white`}
      ></div>
      <CircularProgress
        variant="determinate"
        value={100}
        size="100%"
        thickness={3}
        sx={{ color: "grey.100" }}
      />
      <CircularProgress
        className="absolute"
        variant="determinate"
        value={progress?.isLearned === true ? 100 : 0}
        thickness={3}
        size="100%"
        sx={{ color }}
      />
      <div
        className={`absolute w-3/4 h-3/4 rounded-full`}
        style={{ backgroundColor: color }}
      ></div>
    </>
  );
}

function StaticFrame({ color }: { color?: string }) {
  return <div className={`w-4/5 h-4/5 rounded ${color ?? ""}`}></div>;
}
