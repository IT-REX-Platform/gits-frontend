"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";

import { studentCourseStatsQuery } from "@/__generated__/studentCourseStatsQuery.graphql";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { RewardScoreChart } from "@/components/RewardScoreChart";
import { RewardScoreFilter } from "@/components/RewardScoreFilter";
import {
  RewardScoreFilterType,
  RewardScoreHistoryTable,
} from "@/components/RewardScoreHistoryTable";
import { Subheading } from "@/components/Subheading";

export default function StudentCourseStatsPage() {
  // Get course id from url
  const { courseId: id } = useParams();

  // Fetch course data
  const { coursesByIds } = useLazyLoadQuery<studentCourseStatsQuery>(
    graphql`
      query studentCourseStatsQuery($id: UUID!) {
        coursesByIds(ids: [$id]) {
          rewardScores {
            ...RewardScoreChartFragment
            ...RewardScoreHistoryTableFragment
          }
        }
      }
    `,
    { id }
  );

  // Filter state
  const [chartSelection, setChartSelection] = useState<RewardScoreFilterType[]>(
    ["health", "fitness", "growth", "power"]
  );
  const [historySelection, setHistorySelection] = useState<
    RewardScoreFilterType[]
  >(["health", "fitness", "growth", "power"]);

  // Show 404 error page if id was not found
  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id" />;
  }

  // Extract course
  const course = coursesByIds[0];

  return (
    <main>
      <Heading title="Statistics" backButton />

      <Subheading
        className="mt-10"
        action={
          <RewardScoreFilter
            selection={chartSelection}
            onChange={setChartSelection}
          />
        }
      >
        Overview
      </Subheading>
      <div className="h-96">
        <RewardScoreChart
          _scores={course.rewardScores}
          filter={chartSelection}
        />
      </div>

      <Subheading
        className="mt-12"
        action={
          <RewardScoreFilter
            selection={historySelection}
            onChange={setHistorySelection}
          />
        }
      >
        History
      </Subheading>
      <RewardScoreHistoryTable
        courseId={id}
        _scores={course.rewardScores}
        filter={historySelection}
      />
    </main>
  );
}
