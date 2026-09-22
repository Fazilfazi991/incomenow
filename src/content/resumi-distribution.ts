export const resumiDistributionState = {
  technicalPackageReady: true,
  redistributionApproved: false,
  inspectedSourceCommit: "3ed78e615e746cb9e7e70d3f53625532bfeda9bd",
  packageName: "resumi-resume-builder-distribution.zip",
  packageSha256: "7059EB44A050C8BA28A30B265AAE9B4B76034DB584DFD769522D52849744B6A9",
  packageSizeBytes: 2_407_231,
  packageEntryCount: 169,
  statusLabel: "Source package prepared — release approval required.",
} as const;

export function resumiDistributionDownloadEnabled(state = resumiDistributionState) {
  return state.technicalPackageReady && state.redistributionApproved;
}
