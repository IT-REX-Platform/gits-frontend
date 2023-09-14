import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";
import { MultipleChoiceQuestionPreviewFragment$key } from "@/__generated__/MultipleChoiceQuestionPreviewFragment.graphql";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

export function MultipleChoiceQuestionPreview({
  _question,
}: {
  _question: MultipleChoiceQuestionPreviewFragment$key;
}) {
  const question = useFragment(
    graphql`
      fragment MultipleChoiceQuestionPreviewFragment on MultipleChoiceQuestion {
        text
        answers {
          correct
          answerText
        }
      }
    `,
    _question
  );

  return (
    <div>
      <RenderRichText value={question.text}></RenderRichText>
      <div className="flex flex-wrap gap-2">
        <div className="flex justify-center gap-4">
          <FormGroup>
            {question.answers.map((answer, index) => (
              <div key={index}>
                <FormControlLabel
                  sx={{ cursor: "default" }}
                  control={
                    <Checkbox
                      sx={{ cursor: "default" }}
                      disableRipple
                      checked={answer.correct}
                    />
                  }
                  label={
                    <RenderRichText value={answer.answerText}></RenderRichText>
                  }
                />
              </div>
            ))}
          </FormGroup>
        </div>
      </div>
    </div>
  );
}
