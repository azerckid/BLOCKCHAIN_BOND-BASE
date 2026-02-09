import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { createLogger, defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const defaultLogger = createLogger();
const customLogger = {
  ...defaultLogger,
  warn(msg: string, options?: { clear?: boolean; timestamp?: boolean }) {
    if (typeof msg === "string" && msg.includes("Can't resolve original location of error")) return;
    defaultLogger.warn(msg, options);
  },
};

export default defineConfig({
  customLogger,
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
