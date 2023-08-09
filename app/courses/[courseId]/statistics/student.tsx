"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Error from "next/error";
import { graphql, useLazyLoadQuery } from "react-relay";

import { Heading } from "@/components/Heading";
import { studentCourseStatsQuery } from "@/__generated__/studentCourseStatsQuery.graphql";
import { RewardScoreChart } from "@/components/RewardScoreChart";
import {
  RewardScoreFilterType,
  RewardScoreHistoryTable,
} from "@/components/RewardScoreHistoryTable";
import { Subheading } from "@/components/Subheading";
import { RewardScoreFilter } from "@/components/RewardScoreFilter";

export default function StudentCourseStatsPage() {
  // Get course id from url
  const params = useParams();
  const id = params.courseId;

  // Fetch course data
  const { coursesById } = useLazyLoadQuery<studentCourseStatsQuery>(
    graphql`
      query studentCourseStatsQuery($id: UUID!) {
        coursesById(ids: [$id]) {
          id
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
  if (coursesById.length == 0) {
    return <Error statusCode={404} title="Course could not be found." />;
  }

  // Extract course
  const course = coursesById[0];

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
        _scores={course.rewardScores}
        filter={historySelection}
      />
    </main>
  );
}
