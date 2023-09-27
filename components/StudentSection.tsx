import { studentCoursePageSectionFragment$key } from "@/__generated__/studentCoursePageSectionFragment.graphql";
import { every, orderBy, some } from "lodash";
import { graphql, useFragment } from "react-relay";
import { Section, SectionContent, SectionHeader } from "./Section";
import { StageBarrier } from "./Stage";
import { StudentStage } from "./StudentStage";

export function StudentSection({
  _section,
}: {
  _section: studentCoursePageSectionFragment$key;
}) {
  const section = useFragment(
    graphql`
      fragment studentCoursePageSectionFragment on Section {
        id
        name
        stages {
          id
          position
          requiredContentsProgress
          ...studentCoursePageStageFragment
        }
      }
    `,
    _section
  );

  const stages = orderBy(section.stages, (stage) => stage.position);

  // Workaround until the backend calculates the progress
  const stageComplete = stages.map(
    (stage) => stage.requiredContentsProgress === 100
  );
  const stageDisabled = stages.map((_, i) =>
    some(stages.slice(0, i), (_, idx) => !stageComplete[idx])
  );
  const sectionComplete = every(stages, (_, idx) => stageComplete[idx]);

  return (
    <Section done={sectionComplete}>
      <SectionHeader>{section.name}</SectionHeader>
      <SectionContent>
        {stages.map((stage, i) => (
          <>
            {/* Show barrier if this is the first non-complete stage */}
            {(i == 0
              ? false
              : !stageComplete[i - 1] && !stageDisabled[i - 1]) && (
              <StageBarrier />
            )}
            <StudentStage
              key={stage.id}
              _stage={stage}
              disabled={stageDisabled[i]}
            />
          </>
        ))}
      </SectionContent>
    </Section>
  );
}
