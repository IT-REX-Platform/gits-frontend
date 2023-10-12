"use client";

import { lecturerCourseMembersPageMutation } from "@/__generated__/lecturerCourseMembersPageMutation.graphql";
import {
  lecturerCourseMembersPageQuery,
  UserRoleInCourse,
} from "@/__generated__/lecturerCourseMembersPageQuery.graphql";
import { FormErrors } from "@/components/FormErrors";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { Person } from "@mui/icons-material";
import {
  FormControl,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

export default function LecturerCourseMembersPage() {
  const { courseId } = useParams();
  const [error, setError] = useState<any>(null);

  const { coursesByIds } = useLazyLoadQuery<lecturerCourseMembersPageQuery>(
    graphql`
      query lecturerCourseMembersPageQuery($id: UUID!) {
        coursesByIds(ids: [$id]) {
          memberships {
            __id
            role
            userId
            user {
              id
              userName
            }
          }
        }
      }
    `,
    { id: courseId }
  );

  const [updateMembership, isUpdating] =
    useMutation<lecturerCourseMembersPageMutation>(graphql`
      mutation lecturerCourseMembersPageMutation(
        $input: CourseMembershipInput!
      ) {
        updateMembership(input: $input) {
          __id
          role
        }
      }
    `);

  // Show 404 error page if id was not found
  if (coursesByIds.length == 0) {
    return <PageError message="No course found with given id." />;
  }

  const changeMembership = (
    id: string,
    userId: string,
    role: UserRoleInCourse
  ) => {
    updateMembership({
      variables: {
        input: {
          courseId,
          userId,
          role,
        },
      },
      onError: setError,
      updater(store, result) {
        store.get(id)?.setValue(result.updateMembership.role, "role");
      },
    });
  };

  const course = coursesByIds[0];
  return (
    <main>
      <Heading backButton title="Course members" />

      {error && (
        <div className="mt-4">
          <FormErrors error={error} onClose={() => setError(null)} />
        </div>
      )}

      <List className="!mt-8">
        {course.memberships.map((ms, i) => (
          <ListItem
            key={ms.userId}
            sx={{ py: 2 }}
            className="odd:bg-gray-100 rounded"
            secondaryAction={
              <FormControl size="small">
                <Select
                  value={ms.role}
                  onChange={(e) =>
                    changeMembership(
                      ms.__id,
                      ms.userId,
                      e.target.value as UserRoleInCourse
                    )
                  }
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="TUTOR">Tutor</MenuItem>
                  <MenuItem value="ADMINISTRATOR">Administrator</MenuItem>
                </Select>
              </FormControl>
            }
          >
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary={ms.user?.userName} />
          </ListItem>
        ))}
      </List>
    </main>
  );
}
