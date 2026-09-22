export const zeroDebtSourceState = {
  inspectedSourceCommit: "e5d3b4f600993414a5a277f64bc6d0c95da02c3e",
  verifiedDemoCommit: "b0763b7",
  technicalSourceInspected: true,
  redistributionApproved: false,
  publicDemoDeployed: true,
  publicDemoUrl: "https://zerodebt-public-demo.vercel.app",
  statusLabel: "Source release approval pending.",
} as const;

export const zeroDebtSourceDownloadEnabled = zeroDebtSourceState.technicalSourceInspected
  && zeroDebtSourceState.redistributionApproved;
