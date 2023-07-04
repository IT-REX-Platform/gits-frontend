"use client";

import { pageStudentQuery } from "@/__generated__/pageStudentQuery.graphql";
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
  const { allCourses } = useLazyLoadQuery<pageStudentQuery>(
    graphql`
      query pageStudentQuery {
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
    <div className="p-10">
      <Typography gutterBottom variant="h4" component="div">
        Dashboard
      </Typography>
      <Typography gutterBottom variant="h5" component="div">
        My Courses
      </Typography>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {/* MOCK */}
        {allCourses.elements.map((course) => (
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
              <Link href={{ pathname: `/student/course/${course.id}` }}>
                <Button size="small">Continue</Button>
              </Link>
            </CardActions>
          </Card>
        ))}
      </div>
    </div>
  );
}
