"use client";

import dayjs from "dayjs";
import colors from "tailwindcss/colors";
import lodash from "lodash";
import { graphql, useFragment } from "react-relay";
import { useCallback, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { RewardScoreChartFragment$key } from "@/__generated__/RewardScoreChartFragment.graphql";
import { RewardScoreChartScoreFragment$key } from "@/__generated__/RewardScoreChartScoreFragment.graphql";
import { RewardScoreChartDataFragment$key } from "@/__generated__/RewardScoreChartDataFragment.graphql";
import { RewardScoreFilterType } from "./RewardScoreHistoryTable";

export function RewardScoreChart({
  _scores,
  filter = [],
}: {
  _scores: RewardScoreChartFragment$key;
  filter?: RewardScoreFilterType[];
}) {
  const scores = useFragment(
    graphql`
      fragment RewardScoreChartFragment on RewardScores {
        ...RewardScoreChartDataFragment
      }
    `,
    _scores
  );

  const data = useData(scores);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          type="number"
          scale="time"
          domain={[Math.min, Math.max]}
          tickFormatter={(date) => dayjs(date).format("D.M.YY")}
        />
        <YAxis yAxisId={0} domain={[0, 100]} hide />
        <YAxis yAxisId={1} hide orientation="right" />
        <Tooltip
          labelFormatter={(date) => dayjs(date).format("D. MMMM YYYY")}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="health"
          name="Health"
          stroke={colors.red[500]}
          strokeWidth={2}
          dot={false}
          hide={!filter.includes("health")}
        />
        <Line
          type="monotone"
          dataKey="fitness"
          name="Fitness"
          stroke={colors.blue[500]}
          strokeWidth={2}
          dot={false}
          hide={!filter.includes("fitness")}
        />
        <Line
          type="monotone"
          dataKey="growth"
          name="Growth"
          stroke={colors.green[500]}
          strokeWidth={2}
          dot={false}
          hide={!filter.includes("growth")}
        />
        <Line
          type="monotone"
          dataKey="power"
          name="Power"
          stroke={colors.amber[400]}
          strokeWidth={2}
          dot={false}
          yAxisId={1}
          hide={!filter.includes("power")}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function useRewardScoreData(
  _score: RewardScoreChartScoreFragment$key
): { date: number; value: number }[] {
  const score = useFragment(
    graphql`
      fragment RewardScoreChartScoreFragment on RewardScore {
        log {
          date
          newValue
        }
      }
    `,
    _score
  );

  return score.log.map((entry) => ({
    date: new Date(entry.date).getTime(),
    value: entry.newValue,
  }));
}

function processData<D extends { date: number }>(
  data: D[]
): { [k in string]: D } {
  const mapDate = (entry: D) => dayjs(entry.date).format("YYYY-MM-DD");
  const mapLastEntryOfDate = (entries: D[]) =>
    lodash.sortBy(entries, (entry) => entry.date)[0];

  const byDate = lodash.groupBy(data, mapDate);
  return lodash.mapValues(byDate, mapLastEntryOfDate);
}

type DataEntry = {
  date: number;
  health?: number;
  fitness?: number;
  growth?: number;
  power?: number;
};

function useData(_scores: RewardScoreChartDataFragment$key) {
  const scores = useFragment(
    graphql`
      fragment RewardScoreChartDataFragment on RewardScores {
        health {
          ...RewardScoreChartScoreFragment
        }
        fitness {
          ...RewardScoreChartScoreFragment
        }
        growth {
          ...RewardScoreChartScoreFragment
        }
        power {
          ...RewardScoreChartScoreFragment
        }
      }
    `,
    _scores
  );

  const healthData = useRewardScoreData(scores.health).map(
    ({ date, value }) => ({ date, health: value })
  );
  const fitnessData = useRewardScoreData(scores.fitness).map(
    ({ date, value }) => ({ date, fitness: value })
  );
  const growthData = useRewardScoreData(scores.growth).map(
    ({ date, value }) => ({ date, growth: value })
  );
  const powerData = useRewardScoreData(scores.power).map(({ date, value }) => ({
    date,
    power: value,
  }));

  const combinedData = lodash.sortBy(
    Object.values(
      lodash.merge(
        {},
        processData(healthData),
        processData(fitnessData),
        processData(growthData),
        processData(powerData)
      )
    ),
    (e) => e.date
  );

  let finalData: DataEntry[] = [];
  let lastEntry: DataEntry | null = null;
  for (let entry of combinedData) {
    lastEntry = { ...(lastEntry ?? {}), ...entry };
    finalData.push(lastEntry);
  }

  return finalData;
}
