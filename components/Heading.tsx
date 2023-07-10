import { NavigateBefore } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export function Heading({
  title,
  overline,
  backButton = false,
}: {
  title: string;
  overline?: string;
  backButton?: boolean;
}) {
  const router = useRouter();
  return (
    <div className={`flex items-end gap-2 ${overline ? "-mt-4" : ""}`}>
      {backButton && (
        <IconButton onClick={() => router.back()} sx={{ marginBottom: -0.25 }}>
          <NavigateBefore sx={{ color: "text.primary" }} />
        </IconButton>
      )}
      <div>
        {overline && (
          <Typography variant="overline" sx={{ marginLeft: 0.25 }}>
            {overline}
          </Typography>
        )}
        <Typography variant="h1" sx={{ marginTop: -1 }}>
          {title}
        </Typography>
      </div>
    </div>
  );
}
