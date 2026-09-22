import "server-only";

export const privateResourceManifest = {
  "pergola-source": {
    ideaId: "idea-001",
    filename: "universalpergola-main.zip",
    relativePath: ["private-resources", "pergola", "universalpergola-main.zip"],
    sha256: "5E4DC492F2BD05869AE7FB77A4C83F66908F96FB6CD6329C4BDA1B36970345B5",
    sizeBytes: 754_291,
    approvalState: "owner-approved",
  },
  "pergola-prospects": {
    ideaId: "idea-001",
    filename: "potential-customers.json",
    relativePath: ["private-resources", "pergola", "potential-customers.json"],
    sha256: "46D0022AF7D9BC20790C5BABD733F287B210BC1867B9E5F8B6FD95261940610A",
    sizeBytes: 50_723,
    approvalState: "member-delivery-approved",
  },
  "pergola-setup-guide": {
    ideaId: "idea-001",
    filename: "setup-guide-v1.json",
    relativePath: ["private-resources", "pergola", "setup-guide-v1.json"],
    sha256: "E6B857D51BF9C2E888ED16CDE6711C9EE432E9051CA728A819CFAE7827A541DF",
    sizeBytes: 9_847,
    approvalState: "member-delivery-approved",
  },
  "clinic-source": {
    ideaId: "idea-002",
    filename: "clinic-operations-crm-distribution.zip",
    relativePath: ["private-resources", "clinic", "clinic-operations-crm-distribution.zip"],
    sha256: "58600C10281677E528625F0E3B17EBB981352BFFB30366A0E5903E4DED836CDE",
    sizeBytes: 1_687_530,
    approvalState: "owner-approved",
  },
  "clinic-prospects": {
    ideaId: "idea-002",
    filename: "uae-clinic-prospects-v1.json",
    relativePath: ["private-resources", "clinic", "uae-clinic-prospects-v1.json"],
    sha256: "16542CD14B50428C4F57FBBDF6EB616B09D8C8BD420FBFD9AEB05909FB87FA9E",
    sizeBytes: 83_595,
    approvalState: "member-delivery-approved",
  },
  "clinic-setup-guide": {
    ideaId: "idea-002",
    filename: "setup-guide-v1.json",
    relativePath: ["private-resources", "clinic", "setup-guide-v1.json"],
    sha256: "3D54A08379290C526243DFA3C509A2C95F6B363B0460B3CFD9C4513BDB99210A",
    sizeBytes: 18_082,
    approvalState: "member-delivery-approved",
  },
  "accounting-setup-guide": {
    ideaId: "idea-003",
    filename: "setup-guide-v1.json",
    relativePath: ["private-resources", "accounting", "setup-guide-v1.json"],
    sha256: "7E3890D6C8F7CDC897FB723DB5487F090538A2EB3181BCEC21E2B520BABF9470",
    sizeBytes: 12_928,
    approvalState: "member-delivery-approved",
  },
} as const;

export type PrivateResourceId = keyof typeof privateResourceManifest;
