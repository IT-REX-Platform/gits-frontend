import { useEffect, useState } from "react";
import { FormSection } from "./Form";
import { TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export type ContentMetadataPayload = {
  name: string;
  suggestedDate: string;
  rewardPoints: number;
};

export function ContentMetadataFormSection({
  onChange,
  metadata,
}: {
  onChange: (side: ContentMetadataPayload | null) => void;
  metadata?: ContentMetadataPayload;
}) {
  const [name, setName] = useState(metadata?.name ?? "");
  const [suggestedDate, setSuggestedDate] = useState(
    metadata ? dayjs(metadata.suggestedDate) : null
  );
  const [rewardPointsStr, setRewardPointsStr] = useState(
    metadata?.rewardPoints.toString() ?? "0"
  );
  const rewardPoints = parseInt(rewardPointsStr);

  const valid =
    name.trim() != "" &&
    suggestedDate != null &&
    suggestedDate.isValid() &&
    rewardPoints.toString() === rewardPointsStr;

  useEffect(() => {
    onChange(
      valid
        ? {
            name,
            suggestedDate: suggestedDate.toISOString(),
            rewardPoints,
          }
        : null
    );
  }, [name, suggestedDate, rewardPointsStr]);

  return (
    <FormSection title="Content details">
      <TextField
        className="w-96"
        label="Name"
        variant="outlined"
        value={name}
        error={metadata && name.trim() == ""}
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
      <TextField
        className="w-96"
        label="Reward Points"
        variant="outlined"
        type="number"
        value={rewardPointsStr}
        error={
          !(metadata == null && rewardPointsStr.trim() == "") &&
          rewardPoints.toString() !== rewardPointsStr
        }
        onChange={(e) => setRewardPointsStr(e.target.value)}
        multiline
        required
      />
    </FormSection>
  );
}
