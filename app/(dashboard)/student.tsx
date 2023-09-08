"use client";

import { studentStudentQuery } from "@/__generated__/studentStudentQuery.graphql";
import {
  ArrowForwardIos,
  Check,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
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
      const filtered = courses.filter(
        (course) => course.startYear === currentYear
      );
      filtered.sort((a, b) => b.startDate - a.startDate);
      setFilteredCourses(filtered);
      const notFocused = courses.filter(
        (course) => course.startYear !== currentYear
      );
      notFocused.sort((a, b) => b.startDate - a.startDate);
      setNotFocusesdcourses(notFocused);
    } /* else if (selectedSort === "yearDivision") {
      // Filter and sort courses with specific yearDivision criteria (e.g., FIRST_SEMESTER or SECOND_SEMESTER)
      const filtered = courses.filter(
        (course) =>
          course.yearDivision === "FIRST_SEMESTER" &&
          course.yearDivision !== null
      );
      filtered.sort((a, b) => b.startDate - a.startDate);
      setFilteredCourses(filtered);

      const notFocused = courses.filter(
        (course) =>
          course.yearDivision === "SECOND_SEMESTER" &&
          course.yearDivision !== null
      );
      notFocused.sort((a, b) => b.startDate - a.startDate);
      setNotFocusesdcourses(notFocused);
    } */
  };

  const handleButton = () => {
    setShowAllCourses(!showAllCourses);
  };

  return (
    <main>
      <Typography variant="h1" gutterBottom>
        Dashboard
      </Typography>
      {/* Sort by Selection */}
      <Box sx={{ minWidth: 120, maxWidth: 150, float: "right" }}>
        <FormControl fullWidth>
          <InputLabel>Sort by</InputLabel>
          <Select value={sortBy} onChange={handleChange} label={"Sort By"}>
            <MenuItem value={"title"}>Alphabetically</MenuItem>
            <MenuItem value={"startYear"}>Year</MenuItem>
            {/* <MenuItem value={"yearDivison"}>Year Division</MenuItem> */}
          </Select>
        </FormControl>
      </Box>
      <Typography variant="h2" gutterBottom>
        My Courses
      </Typography>

      {sortBy === "startYear" && (
        <Typography variant="h6" gutterBottom>
          Current Year: {currentYear}
        </Typography>
      )}

      {/* MOCK */}
      {filteredCourses.length === 0 ? (
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
            <Card variant="outlined" className="h-full" key={course.id}>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="aspect-square min-w-[40px] grid">
                    <CircularProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        color: (theme) => theme.palette.grey[200],
                      }}
                      className="col-start-1 row-start-1"
                    />
                    <CircularProgress
                      variant="determinate"
                      value={45}
                      color="success"
                      className="col-start-1 row-start-1"
                    />
                  </div>
                  <Typography
                    variant="h6"
                    component="div"
                    className="shrink text-ellipsis overflow-hidden whitespace-nowrap "
                  >
                    <Link href={{ pathname: `/courses/${course.id}` }}>
                      <Button size="small">{course.title}</Button>
                    </Link>
                    {dayjs(course.startDate).year().toString()}
                  </Typography>
                </div>
              </CardContent>

              <Divider />
              <List>
                <ListItemButton>
                  <ListItemIcon>
                    <Visibility />
                  </ListItemIcon>
                  <ListItemText
                    primary="Watch the next video"
                    secondary="Chapter 4: Interfaces"
                  />
                  <ListItemIcon>
                    <ArrowForwardIos fontSize="small" />
                  </ListItemIcon>
                </ListItemButton>
                <ListItemButton>
                  <ListItemIcon>
                    <Check />
                  </ListItemIcon>
                  <ListItemText
                    primary="Solve the Quiz"
                    secondary="Chapter 4: Interfaces"
                  />
                  <ListItemIcon>
                    <ArrowForwardIos fontSize="small" />
                  </ListItemIcon>
                </ListItemButton>

                <ListItemButton>
                  <ListItemIcon>
                    <Refresh />
                  </ListItemIcon>
                  <ListItemText
                    primary="Refresh your Knowledge"
                    secondary="Chapter 1-3"
                  />
                  <ListItemIcon>
                    <ArrowForwardIos fontSize="small" />
                  </ListItemIcon>
                </ListItemButton>
              </List>
              <Divider />
            </Card>
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
                <Card variant="outlined" className="h-full" key={course.id}>
                  <CardContent>
                    <div className="flex gap-4 items-center">
                      <div className="aspect-square min-w-[40px] grid">
                        <CircularProgress
                          variant="determinate"
                          value={100}
                          sx={{
                            color: (theme) => theme.palette.grey[200],
                          }}
                          className="col-start-1 row-start-1"
                        />
                        <CircularProgress
                          variant="determinate"
                          value={45}
                          color="success"
                          className="col-start-1 row-start-1"
                        />
                      </div>
                      <Typography
                        variant="h6"
                        component="div"
                        className="shrink text-ellipsis overflow-hidden whitespace-nowrap "
                      >
                        <Link href={{ pathname: `/courses/${course.id}` }}>
                          <Button size="small">{course.title}</Button>
                        </Link>
                        {dayjs(course.startDate).year().toString() +
                          course.yearDivision}
                      </Typography>
                    </div>
                  </CardContent>

                  <Divider />
                  <List>
                    <ListItemButton>
                      <ListItemIcon>
                        <Visibility />
                      </ListItemIcon>
                      <ListItemText
                        primary="Watch the next video"
                        secondary="Chapter 4: Interfaces"
                      />
                      <ListItemIcon>
                        <ArrowForwardIos fontSize="small" />
                      </ListItemIcon>
                    </ListItemButton>
                    <ListItemButton>
                      <ListItemIcon>
                        <Check />
                      </ListItemIcon>
                      <ListItemText
                        primary="Solve the Quiz"
                        secondary="Chapter 4: Interfaces"
                      />
                      <ListItemIcon>
                        <ArrowForwardIos fontSize="small" />
                      </ListItemIcon>
                    </ListItemButton>

                    <ListItemButton>
                      <ListItemIcon>
                        <Refresh />
                      </ListItemIcon>
                      <ListItemText
                        primary="Refresh your Knowledge"
                        secondary="Chapter 1-3"
                      />
                      <ListItemIcon>
                        <ArrowForwardIos fontSize="small" />
                      </ListItemIcon>
                    </ListItemButton>
                  </List>
                  <Divider />
                </Card>
              ))}
            </div>
          </>
        )}
    </main>
  );
}
