"use client";

import { studentStudentQuery } from "@/__generated__/studentStudentQuery.graphql";
import { CourseCard } from "@/components/CourseCard";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { chain } from "lodash";
import Link from "next/link";
import { useState } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

export default function StudentPage() {
  const [sortBy, setSortBy] = useState<String>("");
  const currentYear = dayjs().year();
  const [showAllCourses, setShowAllCourses] = useState(false);

  const { currentUserInfo } = useLazyLoadQuery<studentStudentQuery>(
    graphql`
      query studentStudentQuery {
        currentUserInfo {
          courseMemberships {
            role
            course {
              id
              title
              startDate
              startYear
              yearDivision
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
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [notFocusesdcourses, setNotFocusesdcourses] = useState(courses);

  const handleChange = (event: SelectChangeEvent<String>) => {
    const selectedSort = event.target.value as String;
    setSortBy(selectedSort);
    setShowAllCourses(false);

    // Update filteredCourses based on the selected sorting criteria
    if (selectedSort === "title") {
      // Sort courses alphabetically by title
      setFilteredCourses(
        [...courses].sort((a, b) => a.title.localeCompare(b.title))
      );
    } else if (selectedSort === "startYear") {
      // Filter courses that match the currentYear
      const filtered = chain(courses)
        .filter((course) => dayjs(course.startDate).year() === currentYear)
        .orderBy((x) => x.startDate)
        .value();
      setFilteredCourses(filtered);
      const notFocused = chain(courses)
        .filter((course) => dayjs(course.startDate).year() !== currentYear)
        .orderBy((x) => x.startDate)
        .value();

      setNotFocusesdcourses(notFocused);
    }
  };

  const handleButton = () => {
    setShowAllCourses(!showAllCourses);
  };

  return (
    <main>
      <div className="flex flex-wrap justify-between">
        <Typography variant="h1" gutterBottom>
          Dashboard
        </Typography>
        {/* Sort by Selection */}
        <Box sx={{ minWidth: 120, maxWidth: 150 }}>
          <FormControl fullWidth>
            <InputLabel>Sort by</InputLabel>
            <Select value={sortBy} onChange={handleChange} label={"Sort By"}>
              <MenuItem value={"title"}>Alphabetically</MenuItem>
              <MenuItem value={"startYear"}>Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </div>
      <Typography variant="h2" gutterBottom>
        My Courses
      </Typography>

      {sortBy === "startYear" && (
        <Typography variant="h6" gutterBottom>
          Current Year: {currentYear}
        </Typography>
      )}

      {/* MOCK */}
      {filteredCourses.length === 0 && sortBy === "startYear" ? (
        <div className="text-center text-2xl text-slate-400 my-80">
          You have not joined any courses this year. Visit the{" "}
          <Link href="/courses" className="italic hover:text-sky-500">
            Course Catalog
          </Link>{" "}
          to join courses.
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center text-2xl text-slate-400 my-80">
          You have not joined any courses yet. Visit the{" "}
          <Link href="/courses" className="italic hover:text-sky-500">
            Course Catalog
          </Link>{" "}
          to join courses.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} courses={course} />
          ))}
        </div>
      )}
      {!showAllCourses &&
        notFocusesdcourses.length > 0 &&
        sortBy !== "" &&
        sortBy !== "title" && (
          <div className="flex flex-col items-center">
            <Button onClick={handleButton}>Show All Courses</Button>
          </div>
        )}
      {showAllCourses &&
        notFocusesdcourses.length > 0 &&
        sortBy !== "" &&
        sortBy !== "title" && (
          <>
            <div className="flex flex-col items-center">
              <Button onClick={handleButton}>Hide All Courses</Button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
              {notFocusesdcourses.map((course) => (
                <CourseCard key={course.id} courses={course} />
              ))}
            </div>
          </>
        )}
    </main>
  );
}
