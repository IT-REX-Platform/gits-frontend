import { SkillLevelsFragment$key } from "@/__generated__/SkillLevelsFragment.graphql";
import {
  SkillLevelsSuggestionsQuery,
  SkillType,
} from "@/__generated__/SkillLevelsSuggestionsQuery.graphql";
import { Box, CircularProgress, Tooltip } from "@mui/material";
import { ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import colors from "tailwindcss/colors";
import { Suggestion } from "./Suggestion";

export function SkillLevels({
  className = "",
  _chapter,
  courseId,
}: {
  className?: string;
  _chapter: SkillLevelsFragment$key;
  courseId: string;
}) {
  const { skillLevels, id: chapterId } = useFragment(
    graphql`
      fragment SkillLevelsFragment on Chapter {
        id
        skillLevels {
          remember {
            value
          }
          understand {
            value
          }
          apply {
            value
          }
          analyze {
            value
          }
        }
      }
    `,
    _chapter
  );
  return (
    <div
      className={`grid grid-flow-col auto-cols-fr gap-4 items-center ${className}`}
    >
      <SkillLevel
        courseId={courseId}
        label="Remember"
        value={skillLevels.remember.value}
        chapterId={chapterId}
        skillType="REMEMBER"
      />
      <SkillLevel
        courseId={courseId}
        label="Understand"
        value={skillLevels.understand.value}
        chapterId={chapterId}
        skillType="UNDERSTAND"
      />
      <SkillLevel
        courseId={courseId}
        label="Apply"
        value={skillLevels.apply.value}
        chapterId={chapterId}
        skillType="APPLY"
      />
      <SkillLevel
        courseId={courseId}
        label="Analyse"
        value={skillLevels.analyze.value}
        chapterId={chapterId}
        skillType="ANALYSE"
      />
    </div>
  );
}

export function SkillLevel({
  chapterId,
  skillType,
  value,
  label,
  courseId,
}: {
  chapterId: string;
  skillType: SkillType;
  value: number;
  label: string;
  courseId: string;
}) {
  const level = Math.floor(value); // integer part is level
  const progress = (value % 1) * 100; // decimal part is progress

  if (level < 2) {
    return (
      <SkillLevelBase
        courseId={courseId}
        badge={
          <SkillBadge
            color={colors.white}
            level={level}
            progress={progress}
            strokeColor={colors.gray[300]}
            progressColor={colors.gray[400]}
            textColor={colors.gray[600]}
          />
        }
        label={label}
        level="Basic"
        color={colors.gray[100]}
        chapterId={chapterId}
        skillType={skillType}
      />
    );
  } else if (level < 4) {
    return (
      <SkillLevelBase
        courseId={courseId}
        badge={<SkillBadge color="#c0c0c0" level={level} progress={progress} />}
        label={label}
        level="Iron"
        color="#c0c0c0"
        chapterId={chapterId}
        skillType={skillType}
      />
    );
  } else if (level < 6) {
    return (
      <SkillLevelBase
        courseId={courseId}
        badge={<SkillBadge color="#bf8970" level={level} progress={progress} />}
        label={label}
        level="Bronze"
        color="#bf8970"
        chapterId={chapterId}
        skillType={skillType}
      />
    );
  } else if (level < 8) {
    return (
      <SkillLevelBase
        courseId={courseId}
        badge={<SkillBadge color="#d4af37" level={level} progress={progress} />}
        label={label}
        level="Gold"
        color="#d4af37"
        chapterId={chapterId}
        skillType={skillType}
      />
    );
  } else {
    return (
      <SkillLevelBase
        badge={
          <SkillBadge
            color={colors.emerald[600]}
            level={level}
            progress={level >= 10 ? 100 : progress}
          />
        }
        label={label}
        level="Emerald"
        color={colors.emerald[600]}
        chapterId={chapterId}
        skillType={skillType}
        courseId={courseId}
      />
    );
  }
}

export function SkillLevelBase({
  badge,
  label,
  level,
  color,
  chapterId,
  skillType,
  courseId,
}: {
  badge: ReactNode;
  label: string;
  level: string;
  color: string;
  chapterId: string;
  skillType: SkillType;
  courseId: string;
}) {
  const [tooltipsOpen, setTooltipsOpen] = useState(0);
  const [hasSuggestions, setHasSuggestions] = useState<boolean>(true);
  const popperRef = useRef<any>();

  const suggestions = (
    <Suspense fallback={<CircularProgress className="m-2" size="1rem" />}>
      <SkillLevelSuggestions
        courseId={courseId}
        chapterId={chapterId}
        skillType={skillType}
        onLoad={(num) => {
          if (popperRef.current) popperRef.current.update();
          setHasSuggestions(num > 0);
        }}
      />
    </Suspense>
  );

  return (
    <Tooltip
      title={
        <div className="text-center px-1">
          <div
            className="-mt-1 h-1 w-8 rounded-b-sm mx-auto"
            style={{ backgroundColor: color }}
          ></div>
          <div className="mt-1 font-bold">{label}</div>
          <div className="text-[80%]">({level})</div>
        </div>
      }
      placement="top"
      slotProps={{
        popper: {
          modifiers: [
            { name: "offset", options: { offset: [0, -5] } },
            { name: "flip", enabled: false },
          ],
        },
      }}
      classes={{
        tooltip: "!bg-white border !text-gray-800 border-gray-200",
      }}
      open={tooltipsOpen > (hasSuggestions ? 0 : 1)}
      onClose={() => setTooltipsOpen((x) => x - 1)}
      arrow
    >
      <Box>
        <Tooltip
          title={suggestions}
          placement="bottom"
          slotProps={{
            popper: {
              modifiers: [
                { name: "offset", options: { offset: [0, -5] } },
                { name: "flip", enabled: false },
              ],
            },
          }}
          PopperProps={{ popperRef }}
          classes={{
            tooltip: "!bg-white border !text-gray-800 border-gray-200",
          }}
          open={tooltipsOpen > 0 && hasSuggestions}
          onClose={() => setTooltipsOpen((x) => x - 1)}
          arrow
        >
          <Box onMouseEnter={() => setTooltipsOpen(2)}>{badge}</Box>
        </Tooltip>
      </Box>
    </Tooltip>
  );
}

function SkillLevelSuggestions({
  chapterId,
  skillType,
  onLoad,
  courseId,
}: {
  chapterId: string;
  skillType: SkillType;
  onLoad: (num: number) => void;
  courseId: string;
}) {
  const { suggestionsByChapterIds } =
    useLazyLoadQuery<SkillLevelsSuggestionsQuery>(
      graphql`
        query SkillLevelsSuggestionsQuery(
          $chapterId: UUID!
          $skillType: SkillType!
        ) {
          suggestionsByChapterIds(
            chapterIds: [$chapterId]
            amount: 3
            skillTypes: [$skillType]
          ) {
            content {
              id
            }
            ...SuggestionFragment
          }
        }
      `,
      { chapterId, skillType }
    );

  useEffect(
    () => onLoad(suggestionsByChapterIds.length),
    [onLoad, suggestionsByChapterIds]
  );
  if (suggestionsByChapterIds.length === 0) {
    return <div></div>;
  }

  return (
    <div className="font-normal px-1 pb-1">
      <div className="mb-2 text-center font-medium">
        Suggestions for improving your score
      </div>
      <div className="flex flex-col gap-2 items-start">
        {suggestionsByChapterIds.map((suggestion) => (
          <Suggestion
            courseId={courseId}
            key={suggestion.content.id}
            _suggestion={suggestion}
            small
          />
        ))}
      </div>
    </div>
  );
}

function SkillBadge({
  level,
  progress,
  color,
  strokeColor,
  progressColor,
  textColor = "white",
}: {
  level: number;
  progress: number;
  color: string;
  strokeColor?: string;
  progressColor?: string;
  textColor?: string;
}) {
  return (
    <div className="relative h-[3.25rem] w-12 flex justify-center select-none">
      <LevelIcon
        className="h-full"
        color={color}
        progress={progress}
        strokeColor={strokeColor}
        progressColor={progressColor}
      />
      <div
        className="absolute inset-0 drop-shadow flex flex-col items-center justify-center"
        style={{ color: textColor }}
      >
        <div className="mt-0.5 text-xs">level</div>
        <div className="-mt-2 font-bold text-lg">{level}</div>
      </div>
    </div>
  );
}

function LevelIcon({
  className = "",
  color,
  strokeColor,
  progressColor,
  progress,
}: {
  className?: string;
  color: string;
  strokeColor?: string;
  progressColor?: string;
  progress: number;
}) {
  return (
    <svg
      className={className}
      width="288.466"
      height="318.02"
      viewBox="0 0 76.323 84.143"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M69.445 60.133c-1.81 3.135-11.893 8.283-15.028 10.093-3.136 1.81-12.635 7.968-16.255 7.968-3.62 0-13.12-6.158-16.255-7.968-3.136-1.81-13.218-6.958-15.028-10.093-1.81-3.136-1.227-14.441-1.227-18.062 0-3.62-.584-14.925 1.227-18.06 1.81-3.136 11.892-8.284 15.028-10.094 3.135-1.81 12.634-7.968 16.255-7.968 3.62 0 13.12 6.157 16.255 7.968 3.135 1.81 13.217 6.958 15.028 10.093 1.81 3.136 1.227 14.44 1.227 18.061 0 3.62.583 14.926-1.227 18.062z"
        fill={color}
        stroke={strokeColor}
      />
      <path
        d="M72.883 62.118c-2.01 3.48-13.2 9.193-16.68 11.203-3.48 2.009-14.023 8.843-18.041 8.843-4.019 0-14.562-6.834-18.042-8.843-3.48-2.01-14.67-7.723-16.68-11.203-2.009-3.48-1.362-16.028-1.362-20.047 0-4.018-.647-16.566 1.362-20.046 2.01-3.48 13.2-9.194 16.68-11.203 3.48-2.01 14.023-8.844 18.042-8.844 4.018 0 14.561 6.835 18.041 8.844 3.48 2.01 14.67 7.723 16.68 11.203 2.01 3.48 1.362 16.028 1.362 20.046 0 4.019.647 16.567-1.362 20.047z"
        fill="none"
        stroke={progressColor ?? strokeColor ?? color}
        strokeWidth="3.9568648"
        strokeDasharray={`${progress},${100 - progress}`}
        strokeDashoffset="33.3333"
        pathLength="100"
      />
    </svg>
  );
}
