"use client";

import { pageCourseJoinMutation } from "@/__generated__/pageCourseJoinMutation.graphql";
import { pageCourseListItemFragment$key } from "@/__generated__/pageCourseListItemFragment.graphql";
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
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";

export default function StudentCourseList() {
  const [pageView] = usePageView();

  const {
    courses,
    currentUserInfo: { courseMemberships, id: userId },
  } = useLazyLoadQuery<pageCourseListQuery>(
    graphql`
      query pageCourseListQuery($filter: CourseFilter) {
        courses(filter: $filter) {
          elements {
            published
            id
            title
            description
            startYear
            ...pageCourseListItemFragment
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
    { filter: pageView === PageView.Lecturer ? undefined : { published: true } }
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
      x.description.toLowerCase().includes(search.toLowerCase()) ||
      (x.startYear && x.startYear.toString().includes(search))
  );
  const myCourseIds = filteredCourses
    .filter(
      (course) =>
        courseIdsAlreadyJoined.includes(course.id) &&
        (pageView === PageView.Student ||
          courseIdsAlreadyJoinedAsLecturer.includes(course.id))
    )
    .map((course) => course.id);

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
  const searchParams = useSearchParams();
  const [leftCourse, setLeftCourse] = useState(searchParams.has("leftCourse"));

  return (
    <main>
      <Typography variant="h1" gutterBottom>
        Course Catalog
      </Typography>
      {leftCourse && (
        <Alert
          severity="info"
          variant="filled"
          onClose={() => setLeftCourse(false)}
        >
          You have successfully left the course!
        </Alert>
      )}
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

      <Typography variant="h2">My courses</Typography>
      <List>
        {filteredCourses
          .filter((course) => myCourseIds.includes(course.id))
          .map((course) => (
            <CourseListItem
              key={course.id}
              _course={course}
              joined
              lecturer={courseIdsAlreadyJoinedAsLecturer.includes(course.id)}
            />
          ))}
      </List>

      <Typography variant="h2" className="!mt-8">
        All courses
      </Typography>
      <List>
        {filteredCourses
          .filter((course) => !myCourseIds.includes(course.id))
          .map((course) => (
            <CourseListItem
              key={course.id}
              _course={course}
              lecturer={courseIdsAlreadyJoinedAsLecturer.includes(course.id)}
              action={
                ((pageView === PageView.Lecturer &&
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
                )
              }
            />
          ))}
      </List>
    </main>
  );
}

function CourseListItem({
  _course,
  joined = false,
  lecturer = false,
  action,
}: {
  _course: pageCourseListItemFragment$key;
  joined?: boolean;
  lecturer?: boolean;
  action?: ReactNode;
}) {
  const router = useRouter();
  const [pageView] = usePageView();

  const course = useFragment(
    graphql`
      fragment pageCourseListItemFragment on Course {
        id
        title
        description
        startDate
        startYear
      }
    `,
    _course
  );

  const year = course.startYear ?? dayjs(course.startDate).year();

  return (
    <ListItem disablePadding>
      <ListItemButton
        disableRipple={!joined}
        onClick={
          joined ? () => router.push(`/courses/${course.id}`) : undefined
        }
      >
        <ListItemIcon className="!min-w-[4.5rem]">
          <Chip label={year} className="!border-gray-400"></Chip>
        </ListItemIcon>
        <ListItemText
          primary={
            <div className="flex items-center gap-2">
              {course.title}
              {pageView !== PageView.Lecturer && lecturer && (
                <Chip
                  variant="outlined"
                  color="info"
                  size="small"
                  label="Lecturer"
                ></Chip>
              )}
            </div>
          }
          secondary={course.description}
        />
        <ListItemSecondaryAction>{action}</ListItemSecondaryAction>
      </ListItemButton>
    </ListItem>
  );
}
