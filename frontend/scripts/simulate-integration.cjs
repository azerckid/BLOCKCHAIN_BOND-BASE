const API_URL = "http://localhost:5173/api/revenue";
const API_KEY = "test_secret_key_1234";

async function simulate() {
    console.log("🚀 Starting Choonsim Integration E2E Simulation...");

    // 1. Simulate METRICS Update
    console.log("\n--- Sending METRICS Update ---");
    const metricsResponse = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            type: "METRICS",
            data: {
                followers: 65200,
                subscribers: 1540,
                shares: {
                    southAmerica: 75,
                    japan: 20,
                    other: 5
                }
            }
        })
    });
    console.log("Metrics Status:", metricsResponse.status, await metricsResponse.json());

    // 2. Simulate REVENUE Update (Subscription)
    console.log("\n--- Sending REVENUE Update (Subscription) ---");
    const revenueResponse = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            type: "REVENUE",
            data: {
                amount: "500",
                source: "SUBSCRIPTION",
                description: "Monthly subscription revenue (Jan 2026)"
            }
        })
    });
    console.log("Revenue Status:", revenueResponse.status, await revenueResponse.json());

    // 3. Simulate MILESTONE Achievement
    console.log("\n--- Sending MILESTONE Achievement ---");
    const milestoneResponse = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            type: "MILESTONE",
            data: {
                key: "FOLLOWERS_60K",
                description: "Global Fandom reached 60,000 active fans",
                bonusAmount: "100"
            }
        })
    });
    console.log("Milestone Status:", milestoneResponse.status, await milestoneResponse.json());

    console.log("\n✅ Simulation Completed.");
}

simulate().catch(err => {
    console.error("❌ Simulation Failed:", err);
    process.exit(1);
});
