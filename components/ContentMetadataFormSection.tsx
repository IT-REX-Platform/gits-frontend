import {
  Autocomplete,
  Chip,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FormSection } from "./Form";

export type ContentMetadataPayload = {
  name: string;
  suggestedDate: string;
  rewardPoints: number;
  tagNames: readonly string[];
};

export function ContentMetadataFormSection({
  onChange,
  metadata,
}: {
  onChange: (side: ContentMetadataPayload | null) => void;
  metadata?: ContentMetadataPayload | null;
}) {
  const [name, setName] = useState(metadata?.name ?? "");
  const [suggestedDate, setSuggestedDate] = useState(
    metadata ? dayjs(metadata.suggestedDate) : null
  );
  const [tags, setTags] = useState<string[]>([...(metadata?.tagNames ?? [])]);

  const [rewardPoints, setRewardPoints] = useState(metadata?.rewardPoints ?? 0);

  const valid =
    name.trim() != "" &&
    suggestedDate != null &&
    suggestedDate.isValid() &&
    rewardPoints >= 0;

  useEffect(() => {
    onChange(
      valid
        ? {
            name,
            suggestedDate: suggestedDate.toISOString(),
            rewardPoints,
            tagNames: tags,
          }
        : null
    );
  }, [name, suggestedDate, tags, rewardPoints, valid, onChange]);

  return (
    <FormSection title="Content details">
      <TextField
        className="w-96"
        label="Name"
        variant="outlined"
        value={name}
        error={!!metadata && name.trim() == ""}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <DatePicker
        label="Suggested start date"
        value={suggestedDate}
        onChange={setSuggestedDate}
        slotProps={{
          textField: {
            required: true,
            error:
              (metadata != null && suggestedDate == null) ||
              (suggestedDate != null && !suggestedDate.isValid()),
          },
        }}
      />

      <Typography variant="caption" sx={{ marginTop: 1 }}>
        Reward Points
      </Typography>

      <Slider
        sx={{ marginX: 1 }}
        step={5}
        marks={[
          { value: 10, label: "Low" },
          { value: 50, label: "Medium" },
          { value: 90, label: "High" },
        ]}
        min={0}
        max={100}
        valueLabelDisplay="auto"
        value={rewardPoints}
        onChange={(e, a) => setRewardPoints(a as number)}
      />

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
            // the key gets set by "getTagProps"
            // eslint-disable-next-line react/jsx-key
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
