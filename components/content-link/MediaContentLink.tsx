"use client";

import { MediaContentLinkFragment$key } from "@/__generated__/MediaContentLinkFragment.graphql";
import { useRouter } from "next/navigation";
import { graphql, useFragment } from "react-relay";
import { DocumentContentLink } from "./DocumentContentLink";
import { UrlContentLink } from "./UrlContentLink";
import { PresentationContentLink } from "./PresentationContentLink";
import { InvalidContentLink } from "./InvalidContentLink";
import { VideoContentLink } from "./VideoContentLink";
import { UnknownMediaContentLink } from "./UnknownMediaContentLink";
import { ImageContentLink } from "./ImageContentLink";

export function MediaContentLink({
  recordId,
  replace = false,
  _media,
  courseId,
}: {
  recordId?: string;
  replace?: boolean;
  _media: MediaContentLinkFragment$key;
  courseId: string;
}) {
  const router = useRouter();
  const media = useFragment(
    graphql`
      fragment MediaContentLinkFragment on MediaContent {
        id
        metadata {
          name
          chapterId
        }
        ...VideoContentLinkFragment
        ...PresentationContentLinkFragment
        ...DocumentContentLinkFragment
        ...UnknownMediaContentLinkFragment
        ...ImageContentLinkFragment
        mediaRecords {
          id
          type
          name
        }
      }
    `,
    _media
  );

  // if (media.mediaRecords.length == 0) {
  //   return (
  //     <InvalidContent
  //       id={media.id}
  //       chapterId={media.metadata.chapterId}
  //       type="Invalid content"
  //       title={media.metadata.name}
  //     />
  //   );
  // }
  const record = recordId
    ? media.mediaRecords.find((record) => record.id === recordId)
    : media.mediaRecords[0];

  function onClick() {
    const recordSelection = record ? `?recordId=${record.id}` : "";
    const path = `/courses/${courseId}/media/${media.id}${recordSelection}`;
    if (replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  }

  if (!record) {
    return (
      <UnknownMediaContentLink
        title={media.metadata.name}
        onClick={onClick}
        _media={media}
      />
    );
  }

  switch (record.type) {
    case "VIDEO":
      return (
        <VideoContentLink
          title={record.name}
          onClick={onClick}
          _media={media}
        />
      );
    case "PRESENTATION":
      return (
        <PresentationContentLink
          title={record.name}
          onClick={onClick}
          _media={media}
        />
      );
    case "DOCUMENT":
      return (
        <DocumentContentLink
          title={record.name}
          onClick={onClick}
          _media={media}
        />
      );
    case "IMAGE":
      return (
        <ImageContentLink
          title={record.name}
          onClick={onClick}
          _media={media}
        />
      );
    case "URL":
      return <UrlContentLink title={record.name} />;
    default:
      return (
        <InvalidContentLink
          id={media.id}
          chapterId={media.metadata.chapterId}
          type="Unknown content type"
          title={record.name}
        />
      );
  }
}
