import { NavigateBefore } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export function Heading({
  title,
  overline,
  backButton = false,
  action,
}: {
  title: string;
  overline?: string;
  backButton?: boolean;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="flex items-end justify-between">
      <div className={`flex items-end gap-2 ${overline ? "-mt-4" : ""}`}>
        {backButton && (
          <IconButton
            onClick={() => router.back()}
            sx={{ marginBottom: -0.25 }}
          >
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
      {action}
    </div>
  );
}
