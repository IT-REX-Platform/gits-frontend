import { MediaRecordSelector$key } from "@/__generated__/MediaRecordSelector.graphql";
import { FormSection } from "../Form";
import { RichTextEditor } from "../RichTextEditor";

export function HintFormSection({
  _allRecords,
  initialValue,
  onChange,
}: {
  _allRecords: MediaRecordSelector$key;
  initialValue: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <FormSection title="Hint">
      <RichTextEditor
        _allRecords={_allRecords}
        className="w-[700px]"
        label="Hint"
        initialValue={initialValue ?? ""}
        onChange={(value) =>
          onChange(
            value !== '[{"type":"paragraph","children":[{"text":""}]}]'
              ? value
              : null
          )
        }
      />
    </FormSection>
  );
}
