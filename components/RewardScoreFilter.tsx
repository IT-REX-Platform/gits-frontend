import { Checkbox } from "@mui/material";
import { FitnessIcon, GrowthIcon, HealthIcon, PowerIcon } from "./RewardScores";
import colors from "tailwindcss/colors";
import { RewardScoreFilterType } from "./RewardScoreHistoryTable";

export function RewardScoreFilter({
  selection,
  onChange,
}: {
  selection: RewardScoreFilterType[];
  onChange: (value: RewardScoreFilterType[]) => void;
}) {
  function toggleValue(value: RewardScoreFilterType) {
    if (selection.includes(value)) {
      onChange(selection.filter((v) => v != value));
    } else {
      onChange([...selection, value]);
    }
  }

  return (
    <div className="flex gap-1">
      <Checkbox
        icon={<HealthIcon fill={colors.gray[400]} />}
        checkedIcon={<HealthIcon />}
        checked={selection.includes("health")}
        onClick={() => toggleValue("health")}
      />
      <Checkbox
        icon={<FitnessIcon fill={colors.gray[400]} />}
        checkedIcon={<FitnessIcon />}
        checked={selection.includes("fitness")}
        onClick={() => toggleValue("fitness")}
      />
      <Checkbox
        icon={<GrowthIcon fill={colors.gray[400]} />}
        checkedIcon={<GrowthIcon />}
        checked={selection.includes("growth")}
        onClick={() => toggleValue("growth")}
      />
      <Checkbox
        icon={<PowerIcon fill={colors.gray[400]} />}
        checkedIcon={<PowerIcon />}
        checked={selection.includes("power")}
        onClick={() => toggleValue("power")}
      />
    </div>
  );
}
