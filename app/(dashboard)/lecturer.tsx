"use client";

import {
  YearDivision,
  lecturerLecturerDashboardQuery,
} from "@/__generated__/lecturerLecturerDashboardQuery.graphql";
import {
  Add,
  ArrowForwardIos,
  Check,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

export const yearDivisionToStringShort: Record<YearDivision, string> = {
  FIRST_SEMESTER: "Winter",
  SECOND_SEMESTER: "Summer",
  FIRST_TRIMESTER: "1st Trim.",
  SECOND_TRIMESTER: "2nd Trim.",
  THIRD_TRIMESTER: "3rd Trim.",
  FIRST_QUARTER: "Q1",
  SECOND_QUARTER: "Q2",
  THIRD_QUARTER: "Q3",
  FOURTH_QUARTER: "Q4",

  "%future added value": "Unknown",
};

export default function LecturerPage() {
  const { currentUserInfo } = useLazyLoadQuery<lecturerLecturerDashboardQuery>(
    graphql`
      query lecturerLecturerDashboardQuery {
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

  const courses = currentUserInfo.courseMemberships
    .filter((x) => x.role === "TUTOR")
    .map((x) => x.course);

  const { push } = useRouter();

  return (
    <main>
      <Typography variant="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="h2" gutterBottom>
        My Courses
      </Typography>

      <Button
        startIcon={<Add />}
        className="float-right"
        onClick={() => push("/courses/create")}
      >
        Add Course
      </Button>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {courses.map((course) => (
          <Card variant="outlined" className="h-full" key={course.id}>
            <CardContent>
              <div className="flex justify-between">
                <Typography
                  variant="h6"
                  component="div"
                  className="shrink text-ellipsis overflow-hidden whitespace-nowrap "
                >
                  <Link href={`/courses/${course.id}`} color="black">
                    {course.title}
                  </Link>
                </Typography>
                <Chip
                  label={
                    course.yearDivision
                      ? yearDivisionToStringShort[course.yearDivision] +
                        " " +
                        dayjs(course.startDate).year()
                      : dayjs(course.startDate).year()
                  }
                ></Chip>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
