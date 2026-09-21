export const clinicDistributionState = {
  technicalPackageReady: true,
  redistributionApproved: false,
  statusLabel: "Source package prepared — release approval pending.",
} as const;

export function clinicDistributionDownloadEnabled(state = clinicDistributionState) {
  return state.technicalPackageReady && state.redistributionApproved;
}
