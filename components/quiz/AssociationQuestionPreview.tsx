import { AssociationQuestionPreviewFragment$key } from "@/__generated__/AssociationQuestionPreviewFragment.graphql";
import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";

export function AssociationQuestionPreview({
  _question,
}: {
  _question: AssociationQuestionPreviewFragment$key;
}) {
  const question = useFragment(
    graphql`
      fragment AssociationQuestionPreviewFragment on AssociationQuestion {
        text
        correctAssociations {
          left
          right
        }
      }
    `,
    _question
  );

  return (
    <div>
      <div className="mb-2">
        <RenderRichText value={question.text} />
      </div>
      <div className="flex flex-col gap-2">
        {question.correctAssociations.map((elem, i) => (
          <div key={i} className="flex items-center">
            <div className="border rounded-sm px-2">
              <RenderRichText value={elem.left} />
            </div>
            <div className="w-4 border-b"></div>
            <div className="border rounded-sm px-2">
              <RenderRichText value={elem.right} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
