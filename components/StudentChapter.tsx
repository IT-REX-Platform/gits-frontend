import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { ChapterHeader } from "./ChapterHeader";
import { Collapse } from "@mui/material";
import { ChapterContent } from "./ChapterContent";
import { StudentSection } from "./StudentSection";
import { StudentChapterFragment$key } from "@/__generated__/StudentChapterFragment.graphql";
import { OtherContent } from "./OtherContent";

export function StudentChapter({
  _chapter,
}: {
  _chapter: StudentChapterFragment$key;
}) {
  const { courseId } = useParams();
  const chapter = useFragment(
    graphql`
      fragment StudentChapterFragment on Chapter {
        id
        title
        number
        suggestedStartDate
        suggestedEndDate
        ...ChapterHeaderFragment
        ...OtherContentFragment
        sections {
          id
          ...StudentSectionFragment
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
        <ChapterContent>
          {chapter.sections.map((section) => (
            <StudentSection key={section.id} _section={section} />
          ))}
        </ChapterContent>
        <OtherContent _chapter={chapter} />
      </Collapse>
    </section>
  );
}
