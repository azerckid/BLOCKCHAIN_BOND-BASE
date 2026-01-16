import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("bonds", "routes/bonds.tsx"),
    route("portfolio", "routes/portfolio.tsx"),
    route("settings", "routes/settings.tsx"),
    route("admin", "routes/admin.tsx"),
    route("api/auth/*", "routes/auth.ts"),
] satisfies RouteConfig;
