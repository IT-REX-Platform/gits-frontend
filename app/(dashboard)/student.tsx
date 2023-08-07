"use client";

import { studentStudentQuery } from "@/__generated__/studentStudentQuery.graphql";
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

export default function StudentPage() {
  const { currentUserInfo } = useLazyLoadQuery<studentStudentQuery>(
    graphql`
      query studentStudentQuery {
        currentUserInfo {
          courseMemberships {
            role
            course {
              id
              title
            }
          }
        }
      }
    `,
    {}
  );
  const courses = currentUserInfo.courseMemberships.map((x) => x.course);

  return (
    <main>
      <Typography variant="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="h2" gutterBottom>
        My Courses
      </Typography>

      {/* MOCK */}
      {courses.length === 0 ? (
        <div className="text-center text-2xl text-slate-400 m-80">
          You haven't joined any courses yet. Visit the{" "}
          <Link href="/courses" className="italic hover:text-sky-500">
            Course Catalog
          </Link>{" "}
          to join courses.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {courses.map((course) => (
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

              <CardActions>
                <Link href={{ pathname: `/courses/${course.id}` }}>
                  <Button size="small">Continue</Button>
                </Link>
              </CardActions>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
