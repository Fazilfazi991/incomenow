export type PreviewEnvironment = {
  NODE_ENV?: string;
  ENABLE_PREVIEW_ROUTES?: string;
};

export function isPreviewEnabled(environment: PreviewEnvironment) {
  return environment.NODE_ENV !== "production" || environment.ENABLE_PREVIEW_ROUTES === "true";
}

