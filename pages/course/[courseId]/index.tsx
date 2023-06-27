import { CourseIdStudentQuery } from "@/__generated__/CourseIdStudentQuery.graphql";
import Error from "next/error";
import { useRouter } from "next/router";
import { graphql, useLazyLoadQuery } from "react-relay";
import { Typography } from "@mui/material";

import {
  FlashcardContent,
  MaterialContent,
  VideoContent,
} from "@/components/Content";
import { ChapterHeader } from "@/components/ChapterHeader";
import {
  ChapterContent,
  ChapterContentItem,
} from "@/components/ChapterContent";
import dayjs from "dayjs";

export default function CoursePage() {
  return <StudentCoursePage />;
}

function StudentCoursePage() {
  // Get course id from url
  const router = useRouter();
  const id = router.query.courseId;

  // Fetch course data
  const { coursesById } = useLazyLoadQuery<CourseIdStudentQuery>(
    graphql`
      query CourseIdStudentQuery($id: [UUID!]!) {
        coursesById(ids: $id) {
          title
          description
          chapters {
            elements {
              id
              title
              number
              suggestedStartDate
              suggestedEndDate
              contents {
                id
                metadata {
                  name
                  type
                }
              }
            }
          }
        }
      }
    `,
    { id: [id] }
  );

  // Show 404 error page if id was not found
  if (coursesById.length == 0) {
    return <Error statusCode={404} title="Course could not be found." />;
  }

  // Extract course
  const course = coursesById[0];

  return (
    <main className="px-8 py-11">
      <Typography variant="h1" gutterBottom>
        {course.title}
      </Typography>
      <Typography variant="body1">{course.description}</Typography>
      <div className="mb-8"></div>

      <VideoContent subtitle="Publish Subscribe Messaging" progress={60} />
      <FlashcardContent subtitle="Publish Subscribe Messaging" progress={60} />
      <MaterialContent subtitle="Publish Subscribe Messaging" />

      {course.chapters.elements.map((chapter) => (
        <section className="mt-24">
          <ChapterHeader
            title={chapter.title}
            subtitle={`${dayjs(chapter.suggestedStartDate).format(
              "D. MMMM"
            )} – ${dayjs(chapter.suggestedEndDate).format("D. MMMM")}`}
            progress={70}
            skill_levels={{
              remember: "green",
              understand: "green",
              apply: "yellow",
              analyze: "red",
            }}
          />
          <ChapterContent>
            {chapter.contents.length > 0 && (
              <ChapterContentItem first last>
                {chapter.contents.map((content) => (
                  <VideoContent
                    subtitle={content.metadata.name}
                    progress={100}
                  />
                ))}
              </ChapterContentItem>
            )}
          </ChapterContent>
        </section>
      ))}
    </main>
  );
}
