import type { ActionFunctionArgs } from "react-router";
import { db } from "@/db";
import { choonsimRevenue, choonsimProjects, choonsimMilestones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export async function action({ request }: ActionFunctionArgs) {
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const authHeader = request.headers.get("Authorization");
    const apiKey = process.env.CHOONSIM_API_KEY;

    if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, data } = body;

        // Ensure Choonsim project exists
        let project = await db.query.choonsimProjects.findFirst({
            where: eq(choonsimProjects.id, "choonsim-main"),
        });

        if (!project) {
            await db.insert(choonsimProjects).values({
                id: "choonsim-main",
                name: "Chunsim AI-Talk",
                updatedAt: new Date().getTime(),
            });
        }

        if (type === "REVENUE") {
            const { amount, source, description } = data;
            await db.insert(choonsimRevenue).values({
                id: randomUUID(),
                projectId: "choonsim-main",
                amount,
                source,
                description,
                receivedAt: new Date().getTime(),
            });

            // Update project totals (optional optimization)
            if (source === "SUBSCRIPTION") {
                await db.update(choonsimProjects)
                    .set({
                        totalSubscribers: (project?.totalSubscribers || 0) + 1,
                        updatedAt: new Date().getTime()
                    })
                    .where(eq(choonsimProjects.id, "choonsim-main"));
            }
        } else if (type === "MILESTONE") {
            const { key, description, achievedAt, bonusAmount } = data;
            await db.insert(choonsimMilestones).values({
                id: randomUUID(),
                projectId: "choonsim-main",
                key,
                description,
                achievedAt: achievedAt || new Date().getTime(),
                bonusAmount,
            });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("API Revenue Error:", error);
        return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
