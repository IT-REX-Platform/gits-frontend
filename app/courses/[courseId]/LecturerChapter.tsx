"use client";
import { LecturerChapter$key } from "@/__generated__/LecturerChapter.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { AddSectionButton } from "@/components/AddSectionButton";
import { ChapterContent } from "@/components/ChapterContent";
import { ChapterHeader } from "@/components/ChapterHeader";
import EditChapterButton from "@/components/EditChapterButton";
import { OtherContent } from "@/components/OtherContent";
import { graphql, useFragment } from "react-relay";
import { LecturerSection } from "./LecturerSection";

export function LecturerChapter({
  _chapter,
  _mediaRecords,
}: {
  _chapter: LecturerChapter$key;
  _mediaRecords: MediaRecordSelector$key;
}) {
  const chapter = useFragment(
    graphql`
      fragment LecturerChapter on Chapter {
        __id

        ...EditChapterButtonFragment
        ...AddFlashcardSetModalFragment
        ...ChapterHeaderFragment
        ...OtherContentFragment
        id
        title
        course {
          id
        }
        number
        startDate
        sections {
          id
          ...LecturerSectionFragment
        }
        contentsWithNoSection {
          id
          ...ContentLinkFragment
        }
      }
    `,
    _chapter
  );
  return (
    <section key={chapter.id} className="mb-6">
      <ChapterHeader
        courseId={chapter.course.id}
        _chapter={chapter}
        action={
          <EditChapterButton _chapter={chapter} courseId={chapter.course.id} />
        }
      />

      <ChapterContent>
        {chapter.sections.map((section) => (
          <LecturerSection
            _mediaRecords={_mediaRecords}
            _section={section}
            key={section.id}
          />
        ))}
        <AddSectionButton chapterId={chapter.id} />
      </ChapterContent>

      <OtherContent _chapter={chapter} courseId={chapter.course.id} />
    </section>
  );
}
