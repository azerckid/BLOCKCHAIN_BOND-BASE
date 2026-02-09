import {
    isRouteErrorResponse,
    Link,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useRouteError,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import "./index.css";
import { config } from "./config/wagmi";

import { Toaster } from "sonner";

export function ErrorBoundary() {
    const error = useRouteError();
    if (isRouteErrorResponse(error)) {
        return (
            <html lang="en">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <Meta />
                    <Links />
                </head>
                <body className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6">
                    <h1 className="text-2xl font-bold text-neutral-900">{error.status} {error.statusText}</h1>
                    <p className="mt-2 text-neutral-600">{String(error.data ?? "An error occurred.")}</p>
                    <Link to="/" className="mt-6 text-indigo-600 font-medium hover:underline">홈으로 돌아가기</Link>
                    <Scripts />
                </body>
            </html>
        );
    }
    if (error instanceof Error) {
        return (
            <html lang="en">
                <head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <Meta />
                    <Links />
                </head>
                <body className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6">
                    <h1 className="text-2xl font-bold text-neutral-900">오류가 발생했습니다</h1>
                    <p className="mt-2 text-neutral-600">{error.message}</p>
                    <Link to="/" className="mt-6 text-indigo-600 font-medium hover:underline">홈으로 돌아가기</Link>
                    <Scripts />
                </body>
            </html>
        );
    }
    return (
        <html lang="en">
            <head>
                <Meta />
                <Links />
            </head>
            <body className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6">
                <h1 className="text-2xl font-bold text-neutral-900">알 수 없는 오류</h1>
                <Link to="/" className="mt-6 text-indigo-600 font-medium hover:underline">홈으로 돌아가기</Link>
                <Scripts />
            </body>
        </html>
    );
}

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
