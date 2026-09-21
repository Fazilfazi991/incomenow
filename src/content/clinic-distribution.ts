export const clinicDistributionState = {
  technicalPackageReady: true,
  redistributionApproved: true,
  approvalDate: "2026-09-21",
  approvedPackageSha256: "58600C10281677E528625F0E3B17EBB981352BFFB30366A0E5903E4DED836CDE",
  approvedPackageSizeBytes: 1_687_530,
  statusLabel: "Source package available.",
} as const;

export function clinicDistributionDownloadEnabled(state = clinicDistributionState) {
  return state.technicalPackageReady && state.redistributionApproved;
}
