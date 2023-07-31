import { RewardScoresFragment$key } from "@/__generated__/RewardScoresFragment.graphql";
import {
  RewardScoresStatFragment$data,
  RewardScoresStatFragment$key,
} from "@/__generated__/RewardScoresStatFragment.graphql";
import { Tooltip, Typography } from "@mui/material";
import { chain } from "lodash";
import Link from "next/link";
import { ReactElement } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import colors from "tailwindcss/colors";

export function RewardScores({
  _scores,
  courseId,
}: {
  _scores: RewardScoresFragment$key;
  courseId: string;
}) {
  const rewardScores = useFragment(
    graphql`
      fragment RewardScoresFragment on RewardScores {
        health {
          ...RewardScoresStatFragment
        }
        fitness {
          ...RewardScoresStatFragment
        }
        growth {
          ...RewardScoresStatFragment
        }
        power {
          ...RewardScoresStatFragment
        }
      }
    `,
    _scores
  );

  return (
    <div className="flex gap-12">
      <div className="flex flex-col gap-2">
        <StatDisplay
          courseId={courseId}
          label="Health"
          color={colors.red[500]}
          formatter={(x) => x.value}
          icon={<HealthIcon />}
          _score={rewardScores.health}
        />
        <StatDisplay
          courseId={courseId}
          label="Fitness"
          color={colors.blue[500]}
          formatter={(x) => x.value}
          icon={<FitnessIcon />}
          _score={rewardScores.fitness}
        />
      </div>
      <div className="flex flex-col gap-2">
        <StatDisplay
          courseId={courseId}
          label="Growth"
          color={colors.green[500]}
          formatter={(x) => x.percentage * 100}
          icon={<GrowthIcon />}
          _score={rewardScores.growth}
        />
        <StatDisplay
          courseId={courseId}
          label="Power"
          color={colors.amber[400]}
          formatter={(x) => x.value}
          icon={<PowerIcon />}
          noBar
          _score={rewardScores.power}
        />
      </div>
    </div>
  );
}

export function StatDisplay({
  label,
  color,
  icon,
  noBar = false,
  _score,
  formatter,
  courseId,
}: {
  label: string;
  color: string;
  icon: ReactElement;
  noBar?: boolean;
  _score: RewardScoresStatFragment$key;
  courseId: string;
  formatter: (x: RewardScoresStatFragment$data) => number;
}) {
  const data = useFragment(
    graphql`
      fragment RewardScoresStatFragment on RewardScore {
        value
        percentage
        log {
          date
          difference
          associatedContents {
            id
            metadata {
              name
            }
          }
        }
      }
    `,
    _score
  );

  const lastThreeChanges = chain(data.log)
    .orderBy((x) => x.date, "desc")
    .slice(0, 3)
    .value();

  const score = noBar ? (
    <ProgressValue color={color} progress={formatter(data)} />
  ) : (
    <ProgressBar color={color} progress={formatter(data)} />
  );
  const content = (
    <div className="flex items-end gap-4">
      <div className="w-8 flex justify-center">{icon}</div>
      <div className="flex flex-col">
        <Typography variant="caption">{label}</Typography>
        {score}
      </div>
    </div>
  );

  if (data.log.length > 0) {
    return (
      <Tooltip
        title={
          <div>
            Verlauf:
            <br />
            {lastThreeChanges.map((x, index) => (
              <div key={index}>
                {new Date(x.date).toLocaleDateString("de-DE")}&nbsp;&nbsp;{" "}
                {x.difference.toLocaleString("de-DE", {
                  signDisplay: "exceptZero",
                })}{" "}
                Punkte
                <ul className="ml-3 text-gray-300 font-light">
                  {x.associatedContents.map((x, index) => (
                    <li key={index}>
                      {x ? (
                        <Link href={`/courses/${courseId}/media/${x.id}`}>
                          <b className="font-normal">{x.metadata.name}</b>{" "}
                          bearbeitet
                        </Link>
                      ) : (
                        <span>(gelöscht) bearbeitet</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        }
      >
        {content}
      </Tooltip>
    );
  } else {
    return content;
  }
}

export function ProgressValue({
  color,
  progress,
}: {
  color: string;
  progress: number;
}) {
  return (
    <div
      className="h-5 flex items-center font-extrabold text-lg -mt-1"
      style={{ color }}
    >
      {progress}
    </div>
  );
}

export function ProgressBar({
  color,
  progress,
}: {
  color: string;
  progress: number;
}) {
  return (
    <div className="relative rounded-full overflow-hidden h-4 w-48">
      <div className="w-full h-full bg-slate-100"></div>
      <div
        className="absolute top-0 h-full transition-[width] duration-500"
        style={{
          background: color,
          width: `${progress}%`,
        }}
      ></div>
    </div>
  );
}

export function HealthIcon({ fill = colors.red[500] }: { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="30px"
      viewBox="0 0 512 512"
      fill={fill}
    >
      <path d="M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4h87c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31H476.3c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240h-132c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9H16c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9v-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1v5.8c0 16.9-2.8 33.5-8.3 49.1z" />
    </svg>
  );
}

export function FitnessIcon({ fill = colors.blue[500] }: { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="28px"
      viewBox="0 0 448 512"
      fill={fill}
    >
      <path d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288H175.5L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7H272.5L349.4 44.6z" />
    </svg>
  );
}

export function GrowthIcon({ fill = colors.green[500] }: { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="28px"
      viewBox="0 0 512 512"
      fill={fill}
    >
      <path d="M512 32c0 113.6-84.6 207.5-194.2 222c-7.1-53.4-30.6-101.6-65.3-139.3C290.8 46.3 364 0 448 0h32c17.7 0 32 14.3 32 32zM0 96C0 78.3 14.3 64 32 64H64c123.7 0 224 100.3 224 224v32V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V320C100.3 320 0 219.7 0 96z" />
      {/* <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM135.1 217.4c-4.5 4.2-7.1 10.1-7.1 16.3c0 12.3 10 22.3 22.3 22.3H208v96c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V256h57.7c12.3 0 22.3-10 22.3-22.3c0-6.2-2.6-12.1-7.1-16.3L269.8 117.5c-3.8-3.5-8.7-5.5-13.8-5.5s-10.1 2-13.8 5.5L135.1 217.4z" /> */}
    </svg>
  );
}

export function PowerIcon({ fill = colors.amber[400] }: { fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="28px"
      viewBox="0 0 512 512"
      fill={fill}
    >
      <path d="M4.1 38.2C1.4 34.2 0 29.4 0 24.6C0 11 11 0 24.6 0H133.9c11.2 0 21.7 5.9 27.4 15.5l68.5 114.1c-48.2 6.1-91.3 28.6-123.4 61.9L4.1 38.2zm503.7 0L405.6 191.5c-32.1-33.3-75.2-55.8-123.4-61.9L350.7 15.5C356.5 5.9 366.9 0 378.1 0H487.4C501 0 512 11 512 24.6c0 4.8-1.4 9.6-4.1 13.6zM80 336a176 176 0 1 1 352 0A176 176 0 1 1 80 336zm184.4-94.9c-3.4-7-13.3-7-16.8 0l-22.4 45.4c-1.4 2.8-4 4.7-7 5.1L168 298.9c-7.7 1.1-10.7 10.5-5.2 16l36.3 35.4c2.2 2.2 3.2 5.2 2.7 8.3l-8.6 49.9c-1.3 7.6 6.7 13.5 13.6 9.9l44.8-23.6c2.7-1.4 6-1.4 8.7 0l44.8 23.6c6.9 3.6 14.9-2.2 13.6-9.9l-8.6-49.9c-.5-3 .5-6.1 2.7-8.3l36.3-35.4c5.6-5.4 2.5-14.8-5.2-16l-50.1-7.3c-3-.4-5.7-2.4-7-5.1l-22.4-45.4z" />
    </svg>
  );
}
