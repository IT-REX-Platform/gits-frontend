"use client";

import { pageCourseJoinMutation } from "@/__generated__/pageCourseJoinMutation.graphql";
import { pageCourseListQuery } from "@/__generated__/pageCourseListQuery.graphql";
import { pageCourseUpdateMembershipMutation } from "@/__generated__/pageCourseUpdateMembershipMutation.graphql";
import { PageView, usePageView } from "@/src/currentView";
import { ArrowForward } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

export default function StudentCourseList() {
  const [pageView] = usePageView();

  const {
    courses,
    currentUserInfo: { courseMemberships, id: userId },
  } = useLazyLoadQuery<pageCourseListQuery>(
    graphql`
      query pageCourseListQuery {
        courses {
          elements {
            id
            title
            description
          }
        }
        currentUserInfo {
          id
          courseMemberships {
            role
            courseId
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

  const courseIdsAlreadyJoined: string[] =
    courseMemberships?.map((x) => x.courseId) ?? [];
  const courseIdsAlreadyJoinedAsLecturer: string[] =
    courseMemberships
      ?.filter((x) => x.role === "TUTOR")
      .map((x) => x.courseId) ?? [];

  const [search, setSearch] = useState("");

  const filteredCourses = courses.elements.filter(
    (x) =>
      !search ||
      x.title.toLowerCase().includes(search.toLowerCase()) ||
      x.description.toLowerCase().includes(search.toLowerCase())
  );

  const [join] = useMutation<pageCourseJoinMutation>(graphql`
    mutation pageCourseJoinMutation($input: CourseMembershipInput!) {
      createMembership(input: $input) {
        courseId
        role
        course {
          id
          title
        }
      }
    }
  `);
  const [updateMembership] =
    useMutation<pageCourseUpdateMembershipMutation>(graphql`
      mutation pageCourseUpdateMembershipMutation(
        $input: CourseMembershipInput!
      ) {
        updateMembership(input: $input) {
          courseId
          role
          course {
            id
            title
          }
        }
      }
    `);

  const [error, setError] = useState<any>(null);

  const router = useRouter();

  return (
    <main>
      <Typography variant="h1" gutterBottom>
        Course Catalog
      </Typography>

      {error?.source.errors.map((err: any, i: number) => (
        <Alert
          key={i}
          severity="error"
          sx={{ minWidth: 400, maxWidth: 800, width: "fit-content" }}
          onClose={() => setError(null)}
        >
          {err.message}
        </Alert>
      ))}

      <div className="w-full flex my-8">
        <TextField
          id="outlined-basic"
          className="grow"
          label="Search Courses"
          variant="outlined"
          value={search}
          onChange={(x) => setSearch(x.target.value)}
        />
      </div>

      <List>
        {filteredCourses.map((course) => (
          <ListItem key={course.id} disablePadding>
            <ListItemButton
              disableRipple={!courseIdsAlreadyJoined.includes(course.id)}
              onClick={
                courseIdsAlreadyJoined.includes(course.id)
                  ? () => router.push(`/courses/${course.id}`)
                  : undefined
              }
            >
              <ListItemText
                primary={
                  <div className="flex items-center gap-2">
                    {pageView !== PageView.Lecturer &&
                      courseIdsAlreadyJoinedAsLecturer.includes(course.id) && (
                        <Chip
                          variant="outlined"
                          color="info"
                          size="small"
                          label="Lecturer"
                        ></Chip>
                      )}
                    {course.title}
                  </div>
                }
                secondary={course.description}
              />
              <ListItemSecondaryAction>
                {((pageView === PageView.Lecturer &&
                  !courseIdsAlreadyJoinedAsLecturer.includes(course.id)) ||
                  !courseIdsAlreadyJoined.includes(course.id)) && (
                  <Button
                    color="primary"
                    variant="text"
                    endIcon={<ArrowForward />}
                    onClick={() => {
                      (courseIdsAlreadyJoined.includes(course.id)
                        ? updateMembership
                        : join)({
                        variables: {
                          input: {
                            courseId: course.id,
                            role:
                              pageView === PageView.Lecturer
                                ? "TUTOR"
                                : "STUDENT",
                            userId,
                          },
                        },
                        onCompleted() {
                          router.push(`/courses/${course.id}`);
                        },
                        onError: setError,
                        updater(store) {
                          const newRecord = store.getRootField(
                            courseIdsAlreadyJoined.includes(course.id)
                              ? "updateMembership"
                              : "createMembership"
                          )!;
                          const userRecord = store.get(userId)!;
                          const records = userRecord
                            .getLinkedRecords("courseMemberships")!
                            .filter(
                              (x) => x.getValue("courseId") !== course.id
                            );

                          userRecord.setLinkedRecords(
                            [...records, newRecord],
                            "courseMemberships"
                          );
                        },
                      });
                    }}
                  >
                    {/* todo this is just for testing purposes and shouldn't work in the real system */}
                    {pageView === PageView.Lecturer
                      ? !courseIdsAlreadyJoined.includes(course.id)
                        ? "Join as lecturer"
                        : "Promote to lecturer"
                      : "Join course"}
                  </Button>
                )}
              </ListItemSecondaryAction>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </main>
  );
}
