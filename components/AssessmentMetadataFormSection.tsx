import { SkillType } from "@/__generated__/AddFlashcardSetModalAssessmentMutation.graphql";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { FormSection } from "./Form";

export type AssessmentMetadataPayload = {
  skillType: SkillType;
  skillPoints: number;
  initialLearningInterval?: number | null;
};

export function AssessmentMetadataFormSection({
  onChange,
  metadata,
}: {
  onChange: (side: AssessmentMetadataPayload | null) => void;
  metadata?: AssessmentMetadataPayload | null;
}) {
  const [intervalLearning, setIntervalLearning] = useState(false);
  const [interval, setInterval] = useState(metadata?.initialLearningInterval);
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
            initialLearningInterval: intervalLearning ? 1 : undefined,
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
          onChange={(e) => setSkillType(e.target.value as SkillType)}
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
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox onChange={() => setIntervalLearning(!intervalLearning)} />
          }
          label="Do you want to want this content to be learned in an interval?"
        />
      </FormGroup>
      <TextField
        disabled={!intervalLearning}
        className="w-96"
        type="number"
        variant="outlined"
        value={interval}
        defaultValue={"Learning Interval"}
        onChange={(e) => setInterval(parseInt(e.target.value))}
      />
    </FormSection>
  );
}
