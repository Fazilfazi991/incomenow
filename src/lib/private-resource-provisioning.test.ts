import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const resources = [
  ["pergola source", "private-resources/pergola/universalpergola-main.zip", 754_291, "5E4DC492F2BD05869AE7FB77A4C83F66908F96FB6CD6329C4BDA1B36970345B5"],
  ["pergola prospects", "private-resources/pergola/potential-customers.json", 50_723, "46D0022AF7D9BC20790C5BABD733F287B210BC1867B9E5F8B6FD95261940610A"],
  ["pergola guide", "private-resources/pergola/setup-guide-v1.json", 9_847, "E6B857D51BF9C2E888ED16CDE6711C9EE432E9051CA728A819CFAE7827A541DF"],
  ["clinic source", "private-resources/clinic/clinic-operations-crm-distribution.zip", 1_687_530, "58600C10281677E528625F0E3B17EBB981352BFFB30366A0E5903E4DED836CDE"],
  ["clinic prospects", "private-resources/clinic/uae-clinic-prospects-v1.json", 83_595, "16542CD14B50428C4F57FBBDF6EB616B09D8C8BD420FBFD9AEB05909FB87FA9E"],
  ["clinic guide", "private-resources/clinic/setup-guide-v1.json", 18_082, "3D54A08379290C526243DFA3C509A2C95F6B363B0460B3CFD9C4513BDB99210A"],
  ["accounting guide", "private-resources/accounting/setup-guide-v1.json", 12_928, "7E3890D6C8F7CDC897FB723DB5487F090538A2EB3181BCEC21E2B520BABF9470"],
] as const;

const allProvisioned = resources.every(([, relativePath]) => existsSync(path.join(process.cwd(), relativePath)));

describe.skipIf(!allProvisioned)("fully provisioned private resources", () => {
  it.each(resources)("verifies %s against the release manifest", (_label, relativePath, size, sha256) => {
    const bytes = readFileSync(path.join(process.cwd(), relativePath));
    expect(bytes.byteLength).toBe(size);
    expect(createHash("sha256").update(bytes).digest("hex").toUpperCase()).toBe(sha256);
  });

  it("keeps both approved source packages as ZIP payloads", () => {
    for (const relativePath of [resources[0][1], resources[3][1]]) {
      expect(readFileSync(path.join(process.cwd(), relativePath)).subarray(0, 4)).toEqual(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
    }
  });
});
