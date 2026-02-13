import { describe, it, expect } from "vitest";
import { MockFintechAPI, CHOONSIM_BOND_ID } from "../mock-fintech-api.js";

describe("MockFintechAPI", () => {
    it("should return valid asset performance data for CHOONSIM_BOND_ID", async () => {
        const data = await MockFintechAPI.getAssetPerformance(CHOONSIM_BOND_ID);

        expect(data).toBeDefined();
        expect(data.principalPaid).toBeGreaterThanOrEqual(0);
        expect(data.interestPaid).toBeGreaterThanOrEqual(0);
        // status range 0-5
        expect(data.status).toBeGreaterThanOrEqual(0);
        expect(data.status).toBeLessThanOrEqual(5);

        // String formats
        expect(data.proof).toMatch(/^ipfs:\/\//);
        expect(data.reportUrl).toMatch(/^https?:\/\//);
    });

    it("should throw error for non-existent bond ID", async () => {
        await expect(MockFintechAPI.getAssetPerformance(9999)).rejects.toThrow("No data found");
    });
});
