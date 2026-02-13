import { z } from "zod";

/** Choonsim Bond ID registered on-chain via registerBond(101) */
export const CHOONSIM_BOND_ID = 101;

/**
 * Mock API Response Schema
 * Validates the structure and constraints of the simulated financial data.
 */
export const BondPerformanceSchema = z.object({
    principalPaid: z.number().nonnegative(),
    interestPaid: z.number().nonnegative(),
    status: z.number().int().min(0).max(5), // 0: Active, 1: Matured, etc.
    proof: z.string().startsWith("ipfs://"),
    carbonReduced: z.number().nonnegative(),
    jobsCreated: z.number().int().nonnegative(),
    smeSupported: z.number().int().nonnegative(),
    reportUrl: z.string().url(),
});

export type BondPerformanceData = z.infer<typeof BondPerformanceSchema>;

/**
 * MOCK FINTECH API SIMULATION
 * Simulates off-chain revenue data from ChoonSim AI-Talk subscription platform.
 * In production, this would fetch from the ChoonSim backend via api/revenue.
 */
export class MockFintechAPI {
    private static bondData: Record<number, BondPerformanceData> = {
        [CHOONSIM_BOND_ID]: {
            principalPaid: 25000,
            interestPaid: 3500,
            status: 0, // 0 = Active
            proof: "ipfs://QmChoonsimRevenue101",
            carbonReduced: 0,
            jobsCreated: 5,
            smeSupported: 1,
            reportUrl: "https://choonsim.ai/impact/bond-101"
        },
    };

    static async getAssetPerformance(bondId: number): Promise<BondPerformanceData> {
        const entry = this.bondData[bondId];

        // 1. Existence Check
        if (!entry) {
            throw new Error(`[MockAPI] No data found for Bond #${bondId}`);
        }

        // 2. Schema Validation (Simulating strict API contract)
        const validation = BondPerformanceSchema.safeParse(entry);
        if (!validation.success) {
            console.error(`[MockAPI] Data Validation Failed for Bond #${bondId}:`, validation.error.format());
            throw new Error(`[MockAPI] Invalid data structure for Bond #${bondId}`);
        }

        // 3. Simulate periodic revenue growth (~30% chance per cycle)
        if (Math.random() > 0.7) {
            // Safe state update (objects are passed by reference)
            entry.interestPaid += 250;
            entry.principalPaid += 500;
            entry.jobsCreated += 1;
            console.log(`[MockAPI] Revenue updated for Bond #${bondId}: Interest +250, Jobs +1`);
        }

        // Return validated data copy
        return { ...entry };
    }
}
