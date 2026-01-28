const API_URL = "https://blockchain-bond-base.vercel.app/api/revenue";
const API_KEY = "test_secret_key_1234";

// 2분 간격 (120,000ms)
const INTERVAL = 120000;

async function sendUpdate(type, data) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ type, data })
        });
        const result = await response.json();
        console.log(`[${new Date().toLocaleTimeString()}] ${type} Status:`, response.status, result);
    } catch (err) {
        console.error(`❌ [${type}] Update Failed:`, err.message);
    }
}

async function simulate() {
    console.log("🚀 Starting Choonsim Live Revenue Loop...");
    console.log(`⏱️  Update interval: ${INTERVAL / 1000} seconds (2 minutes)`);
    console.log("📊 Revenue scale adjusted for long-term sustainability (5-15 USDC per update)");

    // 초기 실행 내역
    let currentFollowers = 65000;

    const runLoop = async () => {
        // 1. 수익 시뮬레이션 (조금씩 변동을 줌)
        const randomRevenue = (Math.random() * 10 + 5).toFixed(2); // 5 ~ 15 USDC
        await sendUpdate("REVENUE", {
            amount: randomRevenue,
            source: "SUBSCRIPTION",
            description: `Streamed revenue: ${randomRevenue} USDC`
        });

        // 2. 지표 업데이트 (팬덤 성장 시뮬레이션)
        currentFollowers += Math.floor(Math.random() * 50); // 0 ~ 50명 증가
        await sendUpdate("METRICS", {
            followers: currentFollowers,
            subscribers: Math.floor(currentFollowers * 0.02),
            shares: {
                southAmerica: 75,
                japan: 20,
                other: 5
            }
        });

        // 3. 간혹 발생하는 마일스톤 (10% 확률)
        if (Math.random() > 0.9) {
            await sendUpdate("MILESTONE", {
                key: `FANS_${Math.floor(currentFollowers / 1000)}K`,
                description: `Fandom milestone reached: ${currentFollowers} fans`,
                bonusAmount: "5.00"
            });
        }
    };

    // 첫 실행
    await runLoop();

    // 루프 설정
    setInterval(runLoop, INTERVAL);
}

simulate().catch(err => {
    console.error("❌ Simulation Loop Error:", err);
    process.exit(1);
});
