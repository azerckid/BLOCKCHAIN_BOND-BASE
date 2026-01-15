import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import type { Route } from "./+types/root";
import "./index.css";
import { config } from "./config/wagmi";

import { Toaster } from "sonner";

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <Toaster richColors position="top-right" theme="dark" />
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

const queryClient = new QueryClient();

export default function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <Outlet />
            </QueryClientProvider>
        </WagmiProvider>
    );
}
