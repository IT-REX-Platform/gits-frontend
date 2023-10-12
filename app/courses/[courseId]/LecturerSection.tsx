"use client";
import { LecturerSectionFragment$key } from "@/__generated__/LecturerSectionFragment.graphql";
import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { AddStageButton } from "@/components/AddStageButton";
import { DeleteStageButton } from "@/components/DeleteStageButton";
import { EditContentModal } from "@/components/EditContentModal";
import EditSectionButton from "@/components/EditSectionButton";
import { Section, SectionContent, SectionHeader } from "@/components/Section";
import { Stage } from "@/components/Stage";
import { ContentLink } from "@/components/content-link/ContentLink";
import { orderBy } from "lodash";
import { graphql, useFragment } from "react-relay";

graphql`
  fragment LecturerSectionStageFragment on Stage {
    optionalContentsProgress
    requiredContentsProgress
    id
    position
    requiredContents {
      ...ContentLinkFragment

      userProgressData {
        nextLearnDate
      }
      __typename
      id
    }

    optionalContents {
      ...ContentLinkFragment

      userProgressData {
        nextLearnDate
      }
      __typename
      id
    }
  }
`;

export function LecturerSection({
  _section,
  _mediaRecords,
}: {
  _section: LecturerSectionFragment$key;
  _mediaRecords: MediaRecordSelector$key;
}) {
  const section = useFragment(
    graphql`
      fragment LecturerSectionFragment on Section {
        id
        name
        chapterId
        courseId
        stages {
          ...LecturerSectionStageFragment @relay(mask: false)
        }
        chapter {
          ...EditContentModalFragment
        }
      }
    `,
    _section
  );

  return (
    <Section key={section.id}>
      <SectionHeader
        action={
          <EditSectionButton
            name={section.name}
            chapterId={section.chapterId}
            sectionId={section.id}
          />
        }
      >
        {section.name}
      </SectionHeader>
      <SectionContent>
        {orderBy(section.stages, (x) => x.position, "asc").map((stage) => (
          <Stage progress={0} key={stage.id}>
            {stage.requiredContents.map((content) => (
              <ContentLink
                courseId={section.courseId}
                key={content.id}
                _content={content}
              />
            ))}
            {stage.optionalContents.map((content) => (
              <ContentLink
                courseId={section.courseId}
                key={content.id}
                _content={content}
                optional
              />
            ))}
            <div className="mt-4 flex flex-col items-start">
              <EditContentModal
                sectionId={section.id}
                courseId={section.courseId}
                stageId={stage.id}
                chapterId={section.chapterId}
                _mediaRecords={_mediaRecords}
                _chapter={section.chapter}
                optionalRecords={stage.optionalContents.map((x) => x.id)}
                requiredRecords={stage.requiredContents.map((x) => x.id)}
              />
            </div>
            <div className="mt-2">
              <DeleteStageButton stageId={stage.id} sectionId={section.id} />
            </div>
          </Stage>
        ))}
        <Stage progress={0}>
          <AddStageButton sectionId={section.id} />
        </Stage>
      </SectionContent>
    </Section>
  );
}
