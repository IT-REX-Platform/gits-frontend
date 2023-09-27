import { studentCoursePageStageFragment$key } from "@/__generated__/studentCoursePageStageFragment.graphql";
import { useParams } from "next/navigation";
import { graphql, useFragment } from "react-relay";
import { Stage } from "./Stage";
import { ContentLink } from "./Content";

export function StudentStage({
  disabled = false,
  _stage,
}: {
  disabled?: boolean;
  _stage: studentCoursePageStageFragment$key;
}) {
  const { courseId } = useParams();
  const stage = useFragment(
    graphql`
      fragment studentCoursePageStageFragment on Stage {
        requiredContentsProgress
        requiredContents {
          ...ContentLinkFragment
          id
        }
        optionalContents {
          ...ContentLinkFragment
          id
        }
      }
    `,
    _stage
  );

  return (
    <Stage progress={disabled ? 0 : stage.requiredContentsProgress}>
      {stage.requiredContents.map((content) => (
        <ContentLink
          courseId={courseId}
          key={content.id}
          _content={content}
          disabled={disabled}
        />
      ))}
      {stage.optionalContents.map((content) => (
        <ContentLink
          courseId={courseId}
          key={content.id}
          _content={content}
          optional
          disabled={disabled}
        />
      ))}
    </Stage>
  );
}
