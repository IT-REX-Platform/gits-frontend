import { studentCoursePageChapterFragment$key } from "@/__generated__/studentCoursePageChapterFragment.graphql";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { ChapterHeader } from "./ChapterHeader";
import { Collapse } from "@mui/material";
import { ChapterContent } from "./ChapterContent";
import { StudentSection } from "./StudentSection";

export function StudentChapter({
  _chapter,
}: {
  _chapter: studentCoursePageChapterFragment$key;
}) {
  const { courseId } = useParams();
  const chapter = useFragment(
    graphql`
      fragment studentCoursePageChapterFragment on Chapter {
        id
        title
        number
        suggestedStartDate
        suggestedEndDate
        ...ChapterHeaderFragment
        sections {
          id
          ...studentCoursePageSectionFragment
        }
      }
    `,
    _chapter
  );
  const [expanded, setExpanded] = useState(
    dayjs().isBetween(chapter.suggestedStartDate, chapter.suggestedEndDate)
  );

  return (
    <section>
      <ChapterHeader
        courseId={courseId}
        _chapter={chapter}
        expanded={expanded}
        onExpandClick={() => setExpanded((curr) => !curr)}
      />
      <Collapse in={expanded}>
        <div className="mb-6">
          <ChapterContent>
            {chapter.sections.map((section) => (
              <StudentSection key={section.id} _section={section} />
            ))}
          </ChapterContent>{" "}
        </div>
      </Collapse>
    </section>
  );
}
