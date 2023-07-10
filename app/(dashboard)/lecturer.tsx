"use client";

import { lecturerLecturerDashboardQuery } from "@/__generated__/lecturerLecturerDashboardQuery.graphql";
import {
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
  CircularProgress,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

export default function LecturerPage() {
  const { allCourses } = useLazyLoadQuery<lecturerLecturerDashboardQuery>(
    graphql`
      query lecturerLecturerDashboardQuery {
        allCourses: courses {
          elements {
            id
            title
            description
          }
        }
      }
    `,
    {}
  );

  return (
    <main>
      <Typography variant="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="h2" gutterBottom>
        My Courses
      </Typography>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {/* MOCK */}
        {allCourses.elements.map((course) => (
          <Card variant="outlined" className="h-full" key={course.id}>
            <CardContent>
              <div className="flex gap-4 items-center">
                <div className="aspect-square min-w-[40px]">
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    sx={{
                      color: (theme) => theme.palette.grey[200],
                    }}
                    className="absolute"
                  />
                  <CircularProgress
                    variant="determinate"
                    value={45}
                    color="success"
                    className="absolute"
                  />
                </div>
                <Typography
                  variant="h6"
                  component="div"
                  className="shrink text-ellipsis overflow-hidden whitespace-nowrap "
                >
                  {course.title}
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
                  primary="Get quiz results"
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
                  primary="Grade Assignments"
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
                  primary="Check Student Progress"
                  secondary="Chapter 1-3"
                />
                <ListItemIcon>
                  <ArrowForwardIos fontSize="small" />
                </ListItemIcon>
              </ListItemButton>
            </List>
            <Divider />

            <CardActions>
              <Link href={{ pathname: `/courses/${course.id}` }}>
                <Button size="small">Show Details</Button>
              </Link>
            </CardActions>
          </Card>
        ))}
      </div>
    </main>
  );
}
