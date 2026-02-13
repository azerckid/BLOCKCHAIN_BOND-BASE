import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./app/__tests__/setup.ts"],
        include: ["app/**/*.test.{ts,tsx}"],
        exclude: ["node_modules", ".react-router"],
        css: false,
    },
});
