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
  Slider,
  TextField,
  Typography,
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
  const [skillPoints, setSkillPoints] = useState(
    Number(metadata?.skillPoints) || 50
  );

  const valid = skillTypes?.length;

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
  }, [skillTypes, skillPoints, intervalLearning, valid, onChange]);

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

      <Typography variant="caption" sx={{ marginTop: 2 }}>
        Skill Points
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
        value={skillPoints}
        onChange={(e, a) => setSkillPoints(a as number)}
      />
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox onChange={() => setIntervalLearning(!intervalLearning)} />
          }
          label="Do you want to set an inital learning interval?"
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
