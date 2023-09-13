"use client";
import { FormSection } from "@/components/Form";
import { Autocomplete, Chip, TextField } from "@mui/material";

export function TagsSection({
  tags,
  setTags,
}: {
  tags: string[];
  setTags: (tags: string[]) => unknown;
}) {
  return (
    <FormSection title="Tags">
      <Autocomplete
        multiple
        options={[]}
        defaultValue={[]}
        freeSolo
        value={tags}
        className="w-96"
        onChange={(_, newValue: string[]) => {
          setTags(newValue);
        }}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => <TextField {...params} label="Tags" />}
      />
    </FormSection>
  );
}
