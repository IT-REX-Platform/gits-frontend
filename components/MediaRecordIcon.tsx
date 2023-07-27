import { MediaType } from "@/__generated__/MediaContentModalCreateMutation.graphql";
import {
  ArrowRight,
  Description,
  Language,
  PersonalVideo,
  QuestionMark,
} from "@mui/icons-material";

export function MediaRecordIcon({ type }: { type: MediaType }) {
  switch (type) {
    case "DOCUMENT":
      return <Description />;
    case "PRESENTATION":
      return <PersonalVideo />;
    case "VIDEO":
      return <ArrowRight />;
    case "URL":
      return <Language />;
    default:
      return <QuestionMark />;
  }
}
