"use client";

import { studentStudentQuery } from "@/__generated__/studentStudentQuery.graphql";
import { CourseCard, yearDivisionToStringShort } from "@/components/CourseCard";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { chain } from "lodash";
import Link from "next/link";
import { useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

export default function StudentPage() {
  const { currentUserInfo } = useLazyLoadQuery<studentStudentQuery>(
    graphql`
      query studentStudentQuery {
        currentUserInfo {
          id
          courseMemberships {
            role
            course {
              id
              title
              startDate
              startYear
              yearDivision
              ...CourseCardFragment
            }
          }
        }
      }
    `,
    {}
  );

  const courses = currentUserInfo.courseMemberships.map(
    (course) => course.course
  );

  const [sortby, setSortby] = useState<"yearDivision" | "title" | "startYear">(
    "yearDivision"
  );

  const courseSections = chain(courses)
    .groupBy((x) => {
      if (sortby === "startYear") {
        return x.startYear;
      } else if (sortby === "title") {
        return x.title[0];
      } else {
        return x.yearDivision
          ? yearDivisionToStringShort[x.yearDivision] +
              " " +
              dayjs(x.startDate).year()
          : dayjs(x.startDate).year();
      }
    })
    .entries()
    .orderBy(
      sortby === "yearDivision"
        ? [
            ([key, courses]) => courses[0].startYear,
            ([key, courses]) => courses[0].yearDivision,
          ]
        : ([key, _]) => key,

      sortby === "title" ? "asc" : "desc"
    )
    .map(([key, courses]) => {
      return (
        <>
          <Typography variant="h6" gutterBottom>
            {key}
          </Typography>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-8 mb-10">
            {courses.map((course) => (
              <CourseCard key={course.id} _course={course} />
            ))}
          </div>
        </>
      );
    })

    .value();

  return (
    <main>
      <div className="flex flex-wrap justify-between mb-10">
        <Typography variant="h1" gutterBottom>
          Dashboard
        </Typography>
        {/* Sort by Selection */}
        <Box sx={{ minWidth: 120, maxWidth: 150 }}>
          <FormControl fullWidth>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortby}
              onChange={(e) => setSortby(e.target.value as any)}
              label={"Sort By"}
            >
              <MenuItem value={"yearDivision"}>Semester</MenuItem>
              <MenuItem value={"title"}>Alphabetically</MenuItem>
              <MenuItem value={"startYear"}>Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </div>

      {courseSections}

      {courses.length === 0 && (
        <div className="text-center text-2xl text-slate-400 my-80">
          You have not joined any courses yet. Visit the{" "}
          <Link href="/courses" className="italic hover:text-sky-500">
            Course Catalog
          </Link>{" "}
          to join courses.
        </div>
      )}
    </main>
  );
}
