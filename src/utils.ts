export function isUUID(value: string) {
  return !!value
    .toLowerCase()
    .match(
      "^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$"
    );
}

export function cleanupErrorMessage(message: string) {
  return message.replace(
    "See the error `source` property for more information.",
    ""
  );
}
