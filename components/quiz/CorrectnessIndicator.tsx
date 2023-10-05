import { Check, Clear } from "@mui/icons-material";
import clsx from "clsx";

export function CorrectnessIndicator({
  correct,
  disabled = false,
  absolute,
}: {
  correct: boolean;
  disabled?: boolean;
  absolute?: boolean;
}) {
  return (
    <div
      className={clsx({
        "flex items-center": true,
        "absolute left-full inset-y-0 ml-2": absolute,
      })}
    >
      {correct ? (
        <Check fontSize="small" className="!text-green-400" />
      ) : (
        <Clear
          fontSize="small"
          className={disabled ? "!text-gray-400" : "!text-red-400"}
        />
      )}
    </div>
  );
}
