import { useEffect, useState } from "react";
import { FormSection } from "./Form";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

export type AssessmentMetadataPayload = {
  skillType: string;
  skillPoints: number;
};

export function AssessmentMetadataFormSection({
  onChange,
  metadata,
}: {
  onChange: (side: AssessmentMetadataPayload | null) => void;
  metadata?: AssessmentMetadataPayload;
}) {
  const [skillType, setSkillType] = useState(metadata?.skillType);
  const [skillPointsStr, setSkillPointsStr] = useState(
    metadata?.skillPoints.toString() ?? "0"
  );
  const skillPoints = parseInt(skillPointsStr);

  const valid = skillType != null && skillPoints.toString() === skillPointsStr;

  useEffect(() => {
    onChange(
      valid
        ? {
            skillType,
            skillPoints,
          }
        : null
    );
  }, [skillType, skillPointsStr]);

  return (
    <FormSection title="Assessment details">
      <FormControl variant="outlined">
        <InputLabel htmlFor="assessmentSkillTypeInput">Skill Type</InputLabel>
        <Select
          className="min-w-[8rem]"
          label="Skill Type"
          labelId="assessmentSkillTypeLabel"
          value={skillType ?? ""}
          onChange={(e) => setSkillType(e.target.value)}
          inputProps={{ id: "assessmentSkillTypeInput" }}
          required
        >
          <MenuItem value="REMEMBER">Remember</MenuItem>
          <MenuItem value="UNDERSTAND">Understand</MenuItem>
          <MenuItem value="APPLY">Apply</MenuItem>
          <MenuItem value="ANALYSE">Analyse</MenuItem>
        </Select>
      </FormControl>
      <TextField
        className="w-96"
        label="Skill Points"
        variant="outlined"
        type="number"
        value={skillPointsStr}
        error={
          !(metadata == null && skillPointsStr.trim() == "") &&
          skillPoints.toString() !== skillPointsStr
        }
        onChange={(e) => setSkillPointsStr(e.target.value)}
        multiline
        required
      />
    </FormSection>
  );
}
