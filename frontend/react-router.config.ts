import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

export default {
    // Enable server-side rendering
    ssr: true,
    // Vercel preset for deployment
    presets: [vercelPreset()],
} satisfies Config;
