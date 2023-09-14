import { SkillType } from "@/__generated__/AddFlashcardSetModalAssessmentMutation.graphql";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { FormSection } from "./Form";

export type AssessmentMetadataPayload = {
  skillTypes: readonly SkillType[];
  skillPoints: number;
  initialLearningInterval?: number | null;
};

const skillTypeLabel: Record<SkillType, string> = {
  ANALYSE: "Analyse",
  APPLY: "Apply",
  REMEMBER: "Remember",
  UNDERSTAND: "Understand",
  "%future added value": "Unknown",
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
  const [skillTypes, setSkillTypes] = useState(metadata?.skillTypes);
  const [skillPointsStr, setSkillPointsStr] = useState(
    metadata?.skillPoints.toString() ?? "0"
  );
  const skillPoints = parseInt(skillPointsStr);

  const valid = skillTypes?.length && skillPoints.toString() === skillPointsStr;

  useEffect(() => {
    onChange(
      valid
        ? {
            skillTypes: skillTypes ?? [],
            skillPoints,
            initialLearningInterval: intervalLearning ? 1 : undefined,
          }
        : null
    );
  }, [skillTypes, skillPointsStr]);

  return (
    <FormSection title="Assessment details">
      <FormControl variant="outlined">
        <InputLabel htmlFor="assessmentSkillTypeInput">Skill Type</InputLabel>

        <Select
          className="min-w-[16rem] "
          label="Skill Type"
          labelId="assessmentSkillTypeLabel"
          value={skillTypes ?? []}
          onChange={({ target: { value } }) =>
            setSkillTypes(
              (typeof value === "string"
                ? value.split(",")
                : value) as SkillType[]
            )
          }
          renderValue={(selected) =>
            selected.map((x) => skillTypeLabel[x]).join(", ")
          }
          inputProps={{ id: "assessmentSkillTypeInput" }}
          required
          multiple
        >
          {(["REMEMBER", "UNDERSTAND", "APPLY", "ANALYSE"] as const).map(
            (val, i) => (
              <MenuItem value={val} key={i}>
                <Checkbox checked={(skillTypes ?? []).indexOf(val) > -1} />

                <ListItemText>{skillTypeLabel[val]}</ListItemText>
              </MenuItem>
            )
          )}
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
      {intervalLearning && (
        <TextField
          className="w-96"
          type="number"
          variant="outlined"
          value={interval}
          defaultValue={"Learning Interval"}
          label="Interval in days"
          onChange={(e) => setInterval(parseInt(e.target.value))}
        />
      )}
    </FormSection>
  );
}
