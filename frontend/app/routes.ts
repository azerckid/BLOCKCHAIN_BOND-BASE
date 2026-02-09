import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("bonds", "routes/bonds.tsx"),
    route("choonsim", "routes/choonsim.tsx"),
    route("portfolio", "routes/portfolio.tsx"),
    route("settings", "routes/settings.tsx"),
    route("admin", "routes/admin.tsx"),
    route("ai-guide", "routes/ai-guide.tsx"),
    route("impact", "routes/impact.tsx"),
    route("api/auth/*", "routes/auth.ts"),
    route("api/chat", "routes/api.chat.ts"),
    route("api/revenue", "routes/api.revenue.ts"),
    route("api/faucet", "routes/api.faucet.ts"),
    route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
