import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, Meta, Links, ScrollRestoration, Scripts, Link, NavLink, useFetcher } from "react-router";
import { renderToPipeableStream } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider, useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { defineChain, erc20Abi, parseUnits, formatUnits } from "viem";
import { Toaster, toast } from "sonner";
import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Database01Icon, Wallet01Icon, Settings02Icon, Logout01Icon, Menu01Icon, Notification01Icon, Analytics01Icon, Calendar01Icon, CoinsIcon, InformationCircleIcon, Loading03Icon, ChartBreakoutCircleIcon, Location01Icon, ArrowRight01Icon, Coins01Icon, Certificate01Icon, Globe02Icon, Search01Icon, FilterIcon, Sorting03Icon, Clock01Icon, Camera01Icon, CheckmarkBadge01Icon, Unlink01Icon, Alert01Icon, Link01Icon, Moon02Icon, UserCircleIcon, Wallet02Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { Button as Button$1 } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { AlertDialog as AlertDialog$1 } from "@base-ui/react/alert-dialog";
import { Input as Input$1 } from "@base-ui/react/input";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, CartesianGrid, XAxis, YAxis, Area } from "recharts";
import { Tabs as Tabs$1 } from "@base-ui/react/tabs";
import { Avatar as Avatar$1 } from "@base-ui/react/avatar";
import { Separator as Separator$1 } from "@base-ui/react/separator";
import { injected } from "wagmi/connectors";
import { Switch as Switch$1 } from "@base-ui/react/switch";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        ServerRouter,
        {
          context: routerContext,
          url: request.url
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const creditcoinTestnet = defineChain({
  id: 102031,
  name: "Creditcoin Testnet",
  nativeCurrency: {
    name: "Creditcoin",
    symbol: "CTC",
    decimals: 18
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.cc3-testnet.creditcoin.network"]
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://creditcoin-testnet.blockscout.com"
    }
  },
  testnet: true
});
const config = createConfig({
  chains: [creditcoinTestnet],
  transports: {
    [creditcoinTestnet.id]: http()
  }
});
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(Toaster, {
        richColors: true,
        position: "top-right",
        theme: "dark"
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const queryClient = new QueryClient();
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(WagmiProvider, {
    config,
    children: /* @__PURE__ */ jsx(QueryClientProvider, {
      client: queryClient,
      children: /* @__PURE__ */ jsx(Outlet, {})
    })
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Button$1,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
const NavItem = ({ to, icon, label, onClick }) => {
  return /* @__PURE__ */ jsxs(
    NavLink,
    {
      to,
      onClick,
      className: ({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive ? "bg-neutral-900 text-white shadow-lg shadow-neutral-200" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: "shrink-0 transition-transform duration-200 group-hover:scale-110", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon, size: 24 }) }),
        /* @__PURE__ */ jsx("span", { className: "font-medium", children: label })
      ]
    }
  );
};
function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigation = [
    { to: "/", icon: Home01Icon, label: "Dashboard" },
    { to: "/bonds", icon: Database01Icon, label: "Bond Market" },
    { to: "/portfolio", icon: Wallet01Icon, label: "My Portfolio" },
    { to: "/settings", icon: Settings02Icon, label: "Settings" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-neutral-50 flex overflow-hidden", children: [
    isSidebarOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity",
        onClick: () => setIsSidebarOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: "h-20 flex items-center px-8 border-bottom border-neutral-100 italic", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "w-4 h-4 bg-white rounded-sm rotate-45" }) }),
            /* @__PURE__ */ jsx("span", { className: "text-xl font-bold tracking-tight text-neutral-900", children: "BuildCTC" })
          ] }) }),
          /* @__PURE__ */ jsx("nav", { className: "flex-1 px-4 py-6 space-y-2 overflow-y-auto", children: navigation.map((item) => /* @__PURE__ */ jsx(
            NavItem,
            {
              ...item,
              onClick: () => setIsSidebarOpen(false)
            },
            item.to
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 border-t border-neutral-100 mt-auto space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-neutral-200 border-2 border-white shadow-sm overflow-hidden animate-pulse" }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-hidden", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-neutral-900 truncate", children: "Investor Alex" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 truncate", children: "alex@example.com" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "ghost", className: "w-full justify-start gap-3 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 py-6", children: [
              /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Logout01Icon, size: 24 }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Sign Out" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 flex flex-col min-w-0 overflow-hidden relative", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 border-b border-neutral-200/50", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "lg:hidden",
              onClick: () => setIsSidebarOpen(true),
              children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Menu01Icon, size: 24 })
            }
          ),
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-neutral-900" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "hidden sm:flex items-center bg-neutral-100 rounded-full px-4 py-1.5 border border-neutral-200", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-neutral-600", children: "Creditcoin Mainnet" })
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "icon", className: "relative text-neutral-500 hover:text-neutral-900", children: [
            /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Notification01Icon, size: 24 }),
            /* @__PURE__ */ jsx("span", { className: "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-4 lg:p-8 space-y-8", children })
    ] })
  ] });
}
function Card({
  className,
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      "data-size": size,
      className: cn("ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden rounded-xl py-4 text-sm ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col", className),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-4 group-data-[size=sm]/card:px-3", className),
      ...props
    }
  );
}
function CardFooter({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-footer",
      className: cn("bg-muted/50 rounded-b-xl border-t p-4 group-data-[size=sm]/card:p-3 flex items-center", className),
      ...props
    }
  );
}
function StatItem({ title, value, description, trend, icon, vibrant = false, className }) {
  return /* @__PURE__ */ jsxs(Card, { className: cn(
    "border-neutral-200/60 transition-all duration-300 hover:shadow-lg hover:shadow-neutral-200/40 rounded-3xl overflow-hidden",
    vibrant ? "bg-neutral-900 border-none relative" : "bg-white",
    className
  ), children: [
    vibrant && /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" }),
    /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-between items-start mb-4", children: /* @__PURE__ */ jsx("div", { className: cn(
        "p-2.5 rounded-xl",
        vibrant ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-900"
      ), children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon, size: 20 }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("p", { className: cn(
          "text-[10px] font-bold uppercase tracking-widest",
          vibrant ? "text-neutral-400" : "text-neutral-500"
        ), children: title }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2", children: [
          /* @__PURE__ */ jsx("h3", { className: cn(
            "text-2xl font-black tracking-tight",
            vibrant ? "text-white" : "text-neutral-900"
          ), children: value }),
          trend && /* @__PURE__ */ jsxs("span", { className: cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            trend.isUp ? vibrant ? "bg-green-400/20 text-green-400" : "bg-green-50 text-green-600" : vibrant ? "bg-red-400/20 text-red-400" : "bg-red-50 text-red-600"
          ), children: [
            trend.isUp ? "↑" : "↓",
            " ",
            trend.value,
            "%"
          ] })
        ] }),
        description && /* @__PURE__ */ jsx("p", { className: cn(
          "text-xs mt-1",
          vibrant ? "text-neutral-500" : "text-neutral-400"
        ), children: description })
      ] })
    ] })
  ] });
}
function StatSummary({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children });
}
const badgeVariants = cva(
  "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant = "default",
  render,
  ...props
}) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps(
      {
        className: cn(badgeVariants({ className, variant }))
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant
    }
  });
}
function AlertDialog({ ...props }) {
  return /* @__PURE__ */ jsx(AlertDialog$1.Root, { "data-slot": "alert-dialog", ...props });
}
function AlertDialogPortal({ ...props }) {
  return /* @__PURE__ */ jsx(AlertDialog$1.Portal, { "data-slot": "alert-dialog-portal", ...props });
}
function AlertDialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialog$1.Backdrop,
    {
      "data-slot": "alert-dialog-overlay",
      className: cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50",
        className
      ),
      ...props
    }
  );
}
function AlertDialogContent({
  className,
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
    /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
    /* @__PURE__ */ jsx(
      AlertDialog$1.Popup,
      {
        "data-slot": "alert-dialog-content",
        "data-size": size,
        className: cn(
          "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 bg-background ring-foreground/10 gap-4 rounded-xl p-4 ring-1 duration-100 data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        ),
        ...props
      }
    )
  ] });
}
function AlertDialogFooter({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-dialog-footer",
      className: cn(
        "bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function AlertDialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialog$1.Title,
    {
      "data-slot": "alert-dialog-title",
      className: cn("text-sm font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2", className),
      ...props
    }
  );
}
function AlertDialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialog$1.Description,
    {
      "data-slot": "alert-dialog-description",
      className: cn("text-muted-foreground *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3", className),
      ...props
    }
  );
}
function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    AlertDialog$1.Close,
    {
      "data-slot": "alert-dialog-cancel",
      className: cn(className),
      render: /* @__PURE__ */ jsx(Button, { variant, size }),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    Input$1,
    {
      type,
      "data-slot": "input",
      className: cn(
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors file:h-6 file:text-sm file:font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function Label({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "label",
    {
      "data-slot": "label",
      className: cn(
        "gap-2 text-sm leading-none font-medium group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
        className
      ),
      ...props
    }
  );
}
const CONTRACTS = {
  MockUSDC: {
    address: "0x2f60d3a6ef498321592AcE03705DA6aC456E8174",
    abi: [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  BondToken: {
    address: "0x4dFeb91918aEE9C0257d42fEDf52EA0DF3C42A1F",
    abi: [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "AccessControlBadConfirmation",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "neededRole",
            "type": "bytes32"
          }
        ],
        "name": "AccessControlUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          }
        ],
        "name": "ERC1155InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC1155InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "idsLength",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "valuesLength",
            "type": "uint256"
          }
        ],
        "name": "ERC1155InvalidArrayLength",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "ERC1155InvalidOperator",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC1155InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC1155InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "ERC1155MissingApprovalForAll",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "ApprovalForAll",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "previousAdminRole",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "newAdminRole",
            "type": "bytes32"
          }
        ],
        "name": "RoleAdminChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleGranted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleRevoked",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256[]",
            "name": "ids",
            "type": "uint256[]"
          },
          {
            "indexed": false,
            "internalType": "uint256[]",
            "name": "values",
            "type": "uint256[]"
          }
        ],
        "name": "TransferBatch",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "TransferSingle",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "string",
            "name": "value",
            "type": "string"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "URI",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MINTER_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "URI_SETTER_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address[]",
            "name": "accounts",
            "type": "address[]"
          },
          {
            "internalType": "uint256[]",
            "name": "ids",
            "type": "uint256[]"
          }
        ],
        "name": "balanceOfBatch",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "exists",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          }
        ],
        "name": "getRoleAdmin",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "hasRole",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          }
        ],
        "name": "isApprovedForAll",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "tokenUri",
            "type": "string"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256[]",
            "name": "ids",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "mintBatch",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "callerConfirmation",
            "type": "address"
          }
        ],
        "name": "renounceRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256[]",
            "name": "ids",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "values",
            "type": "uint256[]"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "safeBatchTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "safeTransferFrom",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "operator",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "approved",
            "type": "bool"
          }
        ],
        "name": "setApprovalForAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "newuri",
            "type": "string"
          }
        ],
        "name": "setTokenURI",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "newuri",
            "type": "string"
          }
        ],
        "name": "setURI",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "uri",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
  },
  LiquidityPool: {
    address: "0x3d4dfEdbc87f403538AA69B73C94cEf5793B2932",
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_usdcToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_bondToken",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "AccessControlBadConfirmation",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "neededRole",
            "type": "bytes32"
          }
        ],
        "name": "AccessControlUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "investor",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "bondId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "BondPurchased",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "FundsWithdrawn",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "previousAdminRole",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "newAdminRole",
            "type": "bytes32"
          }
        ],
        "name": "RoleAdminChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleGranted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleRevoked",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "ADMIN_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "bondToken",
        "outputs": [
          {
            "internalType": "contract BondToken",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          }
        ],
        "name": "getRoleAdmin",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "hasRole",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "bondId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "purchaseBond",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "callerConfirmation",
            "type": "address"
          }
        ],
        "name": "renounceRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "usdcToken",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "withdrawFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  },
  YieldDistributor: {
    address: "0x039beE3DEa519345305Cb0E697B964F7005431d6",
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_usdcToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_bondToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_targetBondId",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "AccessControlBadConfirmation",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "neededRole",
            "type": "bytes32"
          }
        ],
        "name": "AccessControlUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "previousAdminRole",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "newAdminRole",
            "type": "bytes32"
          }
        ],
        "name": "RoleAdminChanged",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleGranted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "account",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "RoleRevoked",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "YieldClaimed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newRewardPerToken",
            "type": "uint256"
          }
        ],
        "name": "YieldDeposited",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "DEFAULT_ADMIN_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "DISTRIBUTOR_ROLE",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "PRECISION_FACTOR",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "bondToken",
        "outputs": [
          {
            "internalType": "contract BondToken",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "claimYield",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "depositYield",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "earned",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          }
        ],
        "name": "getRoleAdmin",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "grantRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "hasRole",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          },
          {
            "internalType": "uint256[]",
            "name": "",
            "type": "uint256[]"
          },
          {
            "internalType": "bytes",
            "name": "",
            "type": "bytes"
          }
        ],
        "name": "onERC1155BatchReceived",
        "outputs": [
          {
            "internalType": "bytes4",
            "name": "",
            "type": "bytes4"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "",
            "type": "bytes"
          }
        ],
        "name": "onERC1155Received",
        "outputs": [
          {
            "internalType": "bytes4",
            "name": "",
            "type": "bytes4"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "callerConfirmation",
            "type": "address"
          }
        ],
        "name": "renounceRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "revokeRole",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rewardPerToken",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "rewardPerTokenStored",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "rewards",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes4",
            "name": "interfaceId",
            "type": "bytes4"
          }
        ],
        "name": "supportsInterface",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "targetBondId",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "usdcToken",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "userRewardPerTokenPaid",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  }
};
function InvestmentModal({ bond, open, onOpenChange, onInvest }) {
  const [amount, setAmount] = React.useState("");
  const { address, isConnected } = useAccount();
  const { writeContract: writeApprove, data: approveHash, isPending: isApproving, error: approveError } = useWriteContract();
  const { writeContract: writePurchase, data: purchaseHash, isPending: isPurchasing, error: purchaseError } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isPurchaseConfirming, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({ hash: purchaseHash });
  const numericAmount = parseFloat(amount) || 0;
  const estimatedYield = numericAmount * bond.apr / 100;
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.MockUSDC.address,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.LiquidityPool.address] : void 0,
    query: { enabled: !!address && open }
  });
  const parsedAmount = React.useMemo(() => {
    try {
      return parseUnits(amount, 18);
    } catch {
      return 0n;
    }
  }, [amount]);
  const isAllowanceSufficient = allowance ? allowance >= parsedAmount : false;
  React.useEffect(() => {
    if (isApproveSuccess) {
      toast.success("USDC Approved successfully!");
      refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);
  React.useEffect(() => {
    if (isPurchaseSuccess) {
      toast.success("Investment successful!", {
        description: `You have successfully invested ${amount} USDC in ${bond.title}.`
      });
      onInvest(numericAmount);
      onOpenChange(false);
      setAmount("");
    }
  }, [isPurchaseSuccess]);
  React.useEffect(() => {
    if (approveError) toast.error(`Approval failed: ${approveError.message}`);
    if (purchaseError) toast.error(`Investment failed: ${purchaseError.message}`);
  }, [approveError, purchaseError]);
  const handleAction = () => {
    if (!address) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (numericAmount <= 0) return;
    if (!isAllowanceSufficient) {
      writeApprove({
        address: CONTRACTS.MockUSDC.address,
        abi: erc20Abi,
        functionName: "approve",
        args: [CONTRACTS.LiquidityPool.address, parsedAmount]
      });
    } else {
      const bondIdBigInt = BigInt(bond.id);
      writePurchase({
        address: CONTRACTS.LiquidityPool.address,
        abi: CONTRACTS.LiquidityPool.abi,
        functionName: "purchaseBond",
        args: [bondIdBigInt, parsedAmount]
      });
    }
  };
  const isProcessing = isApproving || isApproveConfirming || isPurchasing || isPurchaseConfirming;
  let buttonText = "Confirm Investment";
  if (isApproving || isApproveConfirming) buttonText = "Approving USDC...";
  else if (!isAllowanceSufficient) buttonText = "Approve USDC";
  else if (isPurchasing || isPurchaseConfirming) buttonText = "Purchasing Bond...";
  return /* @__PURE__ */ jsx(AlertDialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(AlertDialogContent, { className: "sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-neutral-900 p-6 text-white", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-4", children: [
        /* @__PURE__ */ jsx(Badge, { className: "bg-white/10 text-white border-white/20 backdrop-blur-md", children: bond.category }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-green-400", children: [
          /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Analytics01Icon, size: 16 }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold", children: [
            bond.apr,
            "% APR"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogTitle, { className: "text-2xl font-black tracking-tight leading-tight mb-2", children: [
        "Invest in ",
        bond.title
      ] }),
      /* @__PURE__ */ jsx(AlertDialogDescription, { className: "text-neutral-400 text-sm italic", children: bond.description })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6 bg-white", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 py-4 px-4 bg-neutral-50 rounded-2xl border border-neutral-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-neutral-400", children: "Term" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-neutral-900 font-bold", children: [
            /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Calendar01Icon, size: 16 }),
            bond.term
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-neutral-400", children: "Remaining" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-neutral-900 font-bold", children: [
            /* @__PURE__ */ jsx(HugeiconsIcon, { icon: CoinsIcon, size: 16 }),
            bond.remainingAmount
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "amount", className: "text-xs font-black uppercase tracking-widest text-neutral-400", children: "Investment Amount (USDC)" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "amount",
                type: "number",
                placeholder: "0.00",
                className: "h-14 text-lg font-bold rounded-xl border-neutral-200 focus:ring-neutral-900 pl-4 pr-16",
                value: amount,
                onChange: (e) => setAmount(e.target.value),
                disabled: isProcessing
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400", children: "USDC" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-blue-600 flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(HugeiconsIcon, { icon: InformationCircleIcon, size: 14 }),
              "Estimated Annual Yield"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm font-black text-blue-700", children: [
              "+ $",
              estimatedYield.toLocaleString(void 0, { minimumFractionDigits: 2 })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-blue-500 italic", children: [
            "* Calculated based on ",
            bond.apr,
            "% APR. Actual returns may vary."
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(AlertDialogFooter, { className: "p-4 bg-neutral-50 border-t border-neutral-100 gap-3", children: [
      /* @__PURE__ */ jsx(
        AlertDialogCancel,
        {
          className: "rounded-xl font-bold h-12 flex-1 hover:bg-white transition-all",
          disabled: isProcessing,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: (e) => {
            e.preventDefault();
            handleAction();
          },
          disabled: numericAmount <= 0 || isProcessing || !isConnected,
          className: "rounded-xl font-bold h-12 flex-1 bg-neutral-900 hover:bg-black text-white hover:shadow-lg transition-all disabled:opacity-50 gap-2",
          children: [
            isProcessing && /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Loading03Icon, className: "animate-spin", size: 18 }),
            isPurchaseSuccess ? "Unbelievable Success!" : buttonText
          ]
        }
      )
    ] })
  ] }) });
}
function BondCard({ bond }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const fetcher = useFetcher();
  const progress = (1 - parseFloat(bond.remainingAmount.replace(/[^0-9.]/g, "")) / parseFloat(bond.totalAmount.replace(/[^0-9.]/g, ""))) * 100;
  const handleInvest = (amount) => {
    fetcher.submit(
      { amount: amount.toString(), bondId: bond.id },
      { method: "post", action: "/bonds" }
    );
  };
  React.useEffect(() => {
    if (fetcher.state === "submitting") {
      toast.loading(`Processing investment for ${bond.title}...`, { id: "invest-loading" });
    }
    if (fetcher.state === "idle" && fetcher.data) {
      toast.dismiss("invest-loading");
      toast.success("Investment successful!", {
        description: `You've successfully invested across Creditcoin.`
      });
      setIsModalOpen(false);
    }
  }, [fetcher.state, fetcher.data, bond.title]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Card, { className: "group overflow-hidden border-neutral-200/60 hover:border-neutral-900/10 hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-300 bg-white", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "p-0", children: /* @__PURE__ */ jsxs("div", { className: "relative h-48 overflow-hidden bg-neutral-900", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950 opacity-90 transition-transform duration-500 group-hover:scale-105"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center p-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsx(Badge, { className: "bg-white/10 text-white border-white/20 backdrop-blur-md mb-2", children: bond.category }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-white tracking-tight leading-tight", children: bond.title })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 focus-visible:outline-none", children: /* @__PURE__ */ jsx(Badge, { variant: bond.status === "active" ? "default" : "secondary", className: cn(
          "shadow-sm",
          bond.status === "active" ? "bg-green-500 hover:bg-green-600 border-none" : ""
        ), children: bond.status.toUpperCase() }) })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-neutral-400", children: "Target yield" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-neutral-900", children: [
              /* @__PURE__ */ jsx(HugeiconsIcon, { icon: ChartBreakoutCircleIcon, size: 18, className: "text-neutral-900" }),
              /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold", children: [
                bond.apr,
                "% ",
                /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-neutral-500", children: "APR" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-neutral-400", children: "Duration" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-neutral-900", children: [
              /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Calendar01Icon, size: 18, className: "text-neutral-600" }),
              /* @__PURE__ */ jsx("p", { className: "text-lg font-bold", children: bond.term })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-wider text-neutral-400", children: "Funding Progress" }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-bold text-neutral-900", children: [
                ((100 - progress) / 10).toFixed(1),
                "M remaining"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm font-black text-neutral-900", children: [
              Math.round(progress),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-neutral-900 rounded-full transition-all duration-1000 ease-out",
              style: { width: `${progress}%` }
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-neutral-500 pt-2 border-t border-neutral-100", children: [
          /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Location01Icon, size: 16 }),
          /* @__PURE__ */ jsx("span", { className: "text-xs font-medium", children: bond.location })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardFooter, { className: "px-6 pb-6 pt-0", children: /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => setIsModalOpen(true),
          className: "w-full group/btn rounded-xl bg-neutral-900 hover:bg-black text-white py-6 h-auto transition-all",
          children: [
            /* @__PURE__ */ jsx("span", { children: "Invest Now" }),
            /* @__PURE__ */ jsx(HugeiconsIcon, { icon: ArrowRight01Icon, size: 18, className: "ml-2 transition-transform group-hover/btn:translate-x-1" })
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(
      InvestmentModal,
      {
        bond,
        open: isModalOpen,
        onOpenChange: setIsModalOpen,
        onInvest: handleInvest
      }
    )
  ] });
}
function meta() {
  return [{
    title: "Dashboard | BuildCTC - RWA Yield Protocol"
  }, {
    name: "description",
    content: "Manage your RWA investments and portfolio"
  }];
}
const MOCK_BONDS$1 = [{
  id: "1",
  title: "SME Working Capital - Bangkok",
  description: "Supporting local retail businesses in the heart of Thailand.",
  apr: 12.5,
  term: "12 Months",
  location: "Bangkok, Thailand",
  totalAmount: "$5.0M",
  remainingAmount: "$1.2M",
  status: "active",
  category: "Real Estate"
}, {
  id: "2",
  title: "Agriculture Supply Chain",
  description: "Post-harvest financing for rice farmers in Northern provinces.",
  apr: 14.2,
  term: "6 Months",
  location: "Chiang Mai, Thailand",
  totalAmount: "$2.0M",
  remainingAmount: "$0.4M",
  status: "active",
  category: "Agriculture"
}, {
  id: "3",
  title: "Clean Energy Infrastructure",
  description: "Solar panel installation for suburban community centers.",
  apr: 11.8,
  term: "24 Months",
  location: "Phuket, Thailand",
  totalAmount: "$8.5M",
  remainingAmount: "$3.1M",
  status: "active",
  category: "Energy"
}];
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx(DashboardLayout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "space-y-10",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "space-y-2",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-3xl font-black tracking-tight text-neutral-900",
          children: "Welcome back, Alex"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-neutral-500 font-medium",
          children: "Your real-world asset portfolio is performing steadily."
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "space-y-4",
        children: [/* @__PURE__ */ jsx("div", {
          className: "flex items-center justify-between",
          children: /* @__PURE__ */ jsx("h2", {
            className: "text-xs font-black uppercase tracking-widest text-neutral-400",
            children: "Key Metrics"
          })
        }), /* @__PURE__ */ jsxs(StatSummary, {
          children: [/* @__PURE__ */ jsx(StatItem, {
            title: "Total Portfolio Value",
            value: "$124,500",
            trend: {
              value: "12.5%",
              isUp: true
            },
            icon: Coins01Icon,
            vibrant: true
          }), /* @__PURE__ */ jsx(StatItem, {
            title: "Average Yield (APR)",
            value: "13.2%",
            icon: Analytics01Icon,
            description: "Weighted across all assets"
          }), /* @__PURE__ */ jsx(StatItem, {
            title: "Unclaimed Yield",
            value: "$1,245.80",
            icon: Certificate01Icon,
            trend: {
              value: "$142.0",
              isUp: true
            }
          }), /* @__PURE__ */ jsx(StatItem, {
            title: "TVL in Protocol",
            value: "$42.5M",
            icon: Globe02Icon,
            description: "+2.4M since last week"
          })]
        })]
      }), /* @__PURE__ */ jsxs("section", {
        className: "space-y-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex items-center justify-between",
          children: [/* @__PURE__ */ jsx("div", {
            className: "space-y-1",
            children: /* @__PURE__ */ jsx("h2", {
              className: "text-xs font-black uppercase tracking-widest text-neutral-400",
              children: "Investment Opportunities"
            })
          }), /* @__PURE__ */ jsx("button", {
            className: "text-sm font-bold text-neutral-900 hover:underline transition-all",
            children: "View All Markets"
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8",
          children: MOCK_BONDS$1.map((bond) => /* @__PURE__ */ jsx(BondCard, {
            bond
          }, bond.id))
        })]
      })]
    })
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
async function action$1({
  request
}) {
  const formData = await request.formData();
  const amount = formData.get("amount");
  const bondId = formData.get("bondId");
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    success: true,
    amount,
    bondId
  };
}
const MOCK_BONDS = [{
  id: "1",
  title: "SME Working Capital - Bangkok",
  description: "Supporting local retail businesses in the heart of Thailand.",
  apr: 12.5,
  term: "12 Months",
  location: "Bangkok, Thailand",
  totalAmount: "$5.0M",
  remainingAmount: "$1.2M",
  status: "active",
  category: "Real Estate"
}, {
  id: "2",
  title: "Agriculture Supply Chain",
  description: "Post-harvest financing for rice farmers in Northern provinces.",
  apr: 14.2,
  term: "6 Months",
  location: "Chiang Mai, Thailand",
  totalAmount: "$2.0M",
  remainingAmount: "$0.4M",
  status: "active",
  category: "Agriculture"
}, {
  id: "3",
  title: "Clean Energy Infrastructure",
  description: "Solar panel installation for suburban community centers.",
  apr: 11.8,
  term: "24 Months",
  location: "Phuket, Thailand",
  totalAmount: "$8.5M",
  remainingAmount: "$3.1M",
  status: "active",
  category: "Energy"
}, {
  id: "4",
  title: "Logistics Fleet Expansion",
  description: "Financing for electric delivery vehicles in urban areas.",
  apr: 13.5,
  term: "18 Months",
  location: "Bangkok, Thailand",
  totalAmount: "$3.5M",
  remainingAmount: "$2.8M",
  status: "active",
  category: "Logistics"
}, {
  id: "5",
  title: "Fishery Modernization",
  description: "Sustainable fishing equipment and cold storage facilities.",
  apr: 15,
  term: "12 Months",
  location: "Rayong, Thailand",
  totalAmount: "$1.5M",
  remainingAmount: "$0.1M",
  status: "active",
  category: "Agriculture"
}];
const CATEGORIES = ["All", "Real Estate", "Agriculture", "Energy", "Logistics"];
const bonds$1 = UNSAFE_withComponentProps(function BondsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const filteredBonds = MOCK_BONDS.filter((bond) => {
    const matchesCategory = selectedCategory === "All" || bond.category === selectedCategory;
    const matchesSearch = bond.title.toLowerCase().includes(searchQuery.toLowerCase()) || bond.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  return /* @__PURE__ */ jsx(DashboardLayout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "space-y-10",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col md:flex-row md:items-end justify-between gap-4",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "space-y-2",
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-3xl font-black tracking-tight text-neutral-900",
            children: "Bond Market"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-neutral-500 font-medium italic",
            children: "Discover high-yield real-world assets on Creditcoin."
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-2",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "relative w-full md:w-64",
            children: [/* @__PURE__ */ jsx(HugeiconsIcon, {
              icon: Search01Icon,
              size: 18,
              className: "absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            }), /* @__PURE__ */ jsx(Input, {
              placeholder: "Search by name or location...",
              className: "pl-10 rounded-xl bg-white border-neutral-200",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value)
            })]
          }), /* @__PURE__ */ jsx(Button, {
            variant: "outline",
            size: "icon",
            className: "rounded-xl border-neutral-200",
            children: /* @__PURE__ */ jsx(HugeiconsIcon, {
              icon: FilterIcon,
              size: 18
            })
          }), /* @__PURE__ */ jsx(Button, {
            variant: "outline",
            size: "icon",
            className: "rounded-xl border-neutral-200",
            children: /* @__PURE__ */ jsx(HugeiconsIcon, {
              icon: Sorting03Icon,
              size: 18
            })
          })]
        })]
      }), /* @__PURE__ */ jsx("div", {
        className: "flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide",
        children: CATEGORIES.map((category) => /* @__PURE__ */ jsx("button", {
          onClick: () => setSelectedCategory(category),
          className: cn("px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap", selectedCategory === category ? "bg-neutral-900 text-white shadow-lg shadow-neutral-200" : "text-neutral-500 hover:bg-neutral-100"),
          children: category
        }, category))
      }), filteredBonds.length > 0 ? /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8",
        children: filteredBonds.map((bond) => /* @__PURE__ */ jsx(BondCard, {
          bond
        }, bond.id))
      }) : /* @__PURE__ */ jsxs("div", {
        className: "h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-white border border-dashed border-neutral-200 rounded-3xl",
        children: [/* @__PURE__ */ jsx("div", {
          className: "p-4 bg-neutral-50 rounded-full text-neutral-300",
          children: /* @__PURE__ */ jsx(HugeiconsIcon, {
            icon: Search01Icon,
            size: 48
          })
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-lg font-bold text-neutral-900",
            children: "No bonds found"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-sm text-neutral-500",
            children: "Try adjusting your search or filters."
          })]
        }), /* @__PURE__ */ jsx(Button, {
          variant: "link",
          onClick: () => {
            setSelectedCategory("All");
            setSearchQuery("");
          },
          children: "Clear all filters"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "pt-10 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-6",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "space-y-0.5",
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-[10px] font-bold uppercase tracking-widest text-neutral-400",
              children: "Total Market Cap"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xl font-black text-neutral-900",
              children: "$242.8M"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-0.5",
            children: [/* @__PURE__ */ jsx("p", {
              className: "text-[10px] font-bold uppercase tracking-widest text-neutral-400",
              children: "Avg. Market APR"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xl font-black text-neutral-900",
              children: "12.8%"
            })]
          })]
        }), /* @__PURE__ */ jsx("p", {
          className: "text-xs text-neutral-400 italic",
          children: "Data updated real-time from Creditcoin Universal Oracle"
        })]
      })]
    })
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  MOCK_BONDS,
  action: action$1,
  default: bonds$1
}, Symbol.toStringTag, { value: "Module" }));
const DATA$1 = [
  { name: "Real Estate", value: 45, color: "#171717" },
  { name: "Agriculture", value: 25, color: "#3B82F6" },
  { name: "Energy", value: 15, color: "#10B981" },
  { name: "Logistics", value: 15, color: "#F59E0B" }
];
function AllocationChart() {
  return /* @__PURE__ */ jsxs(Card, { className: "border-neutral-200/60 shadow-sm rounded-3xl overflow-hidden", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-bold uppercase tracking-widest text-neutral-400", children: "Asset Allocation" }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "h-[300px] pt-0", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
      /* @__PURE__ */ jsx(
        Pie,
        {
          data: DATA$1,
          cx: "50%",
          cy: "50%",
          innerRadius: 60,
          outerRadius: 80,
          paddingAngle: 5,
          dataKey: "value",
          children: DATA$1.map((entry2, index) => /* @__PURE__ */ jsx(Cell, { fill: entry2.color, stroke: "none" }, `cell-${index}`))
        }
      ),
      /* @__PURE__ */ jsx(
        Tooltip,
        {
          contentStyle: { borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" },
          itemStyle: { fontSize: "12px", fontWeight: "bold" }
        }
      ),
      /* @__PURE__ */ jsx(
        Legend,
        {
          verticalAlign: "bottom",
          align: "center",
          iconType: "circle",
          formatter: (value) => /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-neutral-600 ml-1", children: value })
        }
      )
    ] }) }) })
  ] });
}
const DATA = [
  { month: "Aug", yield: 120 },
  { month: "Sep", yield: 250 },
  { month: "Oct", yield: 180 },
  { month: "Nov", yield: 420 },
  { month: "Dec", yield: 350 },
  { month: "Jan", yield: 580 }
];
function PerformanceChart() {
  return /* @__PURE__ */ jsxs(Card, { className: "border-neutral-200/60 shadow-sm rounded-3xl overflow-hidden", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-bold uppercase tracking-widest text-neutral-400", children: "Cumulative Yield (USDC)" }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "h-[300px] pt-4", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: DATA, children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorYield", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#171717", stopOpacity: 0.1 }),
        /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#171717", stopOpacity: 0 })
      ] }) }),
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#F5F5F5" }),
      /* @__PURE__ */ jsx(
        XAxis,
        {
          dataKey: "month",
          axisLine: false,
          tickLine: false,
          tick: { fontSize: 10, fontWeight: "bold", fill: "#A3A3A3" },
          dy: 10
        }
      ),
      /* @__PURE__ */ jsx(
        YAxis,
        {
          axisLine: false,
          tickLine: false,
          tick: { fontSize: 10, fontWeight: "bold", fill: "#A3A3A3" }
        }
      ),
      /* @__PURE__ */ jsx(
        Tooltip,
        {
          contentStyle: { borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" },
          labelStyle: { fontWeight: "black", marginBottom: "4px" },
          itemStyle: { fontSize: "12px", fontWeight: "bold", color: "#171717" }
        }
      ),
      /* @__PURE__ */ jsx(
        Area,
        {
          type: "monotone",
          dataKey: "yield",
          stroke: "#171717",
          strokeWidth: 3,
          fillOpacity: 1,
          fill: "url(#colorYield)"
        }
      )
    ] }) }) })
  ] });
}
function InvestmentRow({ inv, address }) {
  const isYieldSupported = inv.id === "1";
  const { data: earnedAmount, refetch: refetchEarned } = useReadContract({
    address: CONTRACTS.YieldDistributor.address,
    abi: CONTRACTS.YieldDistributor.abi,
    functionName: "earned",
    args: [address],
    query: {
      enabled: isYieldSupported && !!address,
      refetchInterval: 5e3
    }
  });
  const formattedYield = earnedAmount ? formatUnits(earnedAmount, 18) : "0";
  const hasYield = earnedAmount && earnedAmount > 0n;
  const { data: hash, isPending: isClaimPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash
  });
  React.useEffect(() => {
    if (isClaimSuccess) {
      toast.success("Yield claimed successfully!");
      refetchEarned();
    }
  }, [isClaimSuccess, refetchEarned]);
  const handleClaim = () => {
    if (!isYieldSupported) return;
    writeContract({
      address: CONTRACTS.YieldDistributor.address,
      abi: CONTRACTS.YieldDistributor.abi,
      functionName: "claimYield"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white border border-neutral-100 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 hover:border-neutral-900/10 hover:shadow-lg transition-all", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4 items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Clock01Icon, size: 24 }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-bold text-neutral-900", children: inv.title }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-neutral-500 font-medium", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            Number(inv.formattedBalance).toLocaleString(),
            " USDC invested"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            inv.apr,
            "% APR"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between xl:justify-end gap-6 md:gap-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-right flex flex-col items-end", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-neutral-400", children: "Unclaimed Yield" }),
        isYieldSupported ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-lg font-black text-neutral-900 text-green-600", children: [
            "$",
            Number(formattedYield).toFixed(4)
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              className: "h-7 px-3 text-xs bg-green-600 hover:bg-green-700",
              disabled: !hasYield || isClaimPending || isConfirming,
              onClick: handleClaim,
              children: isClaimPending || isConfirming ? "Claiming..." : "Claim"
            }
          )
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-neutral-400", children: "Not Integrated" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-neutral-400", children: "Term" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-neutral-900", children: inv.term })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "hidden sm:block", children: /* @__PURE__ */ jsx(Badge, { className: "bg-green-500 hover:bg-green-600 border-none", children: "Active" }) })
    ] })
  ] });
}
function InvestmentList() {
  const { address } = useAccount();
  const bondIds = MOCK_BONDS.map((b) => BigInt(b.id));
  const accounts = MOCK_BONDS.map(() => address);
  const { data: balances, isLoading } = useReadContract({
    address: CONTRACTS.BondToken.address,
    abi: CONTRACTS.BondToken.abi,
    functionName: "balanceOfBatch",
    args: address ? [accounts, bondIds] : void 0,
    query: {
      enabled: !!address,
      refetchInterval: 5e3
    }
  });
  const myInvestments = MOCK_BONDS.map((bond, index) => {
    const currentBalances = balances;
    const balance = currentBalances ? currentBalances[index] : 0n;
    return {
      ...bond,
      balance,
      // BigInt
      formattedBalance: balance ? formatUnits(balance, 18) : "0"
    };
  }).filter((inv) => inv.balance > 0n);
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-neutral-400 animate-pulse", children: "Loading investments..." });
  }
  if (!address) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-center text-neutral-400", children: "Please connect your wallet to view investments." });
  }
  if (myInvestments.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "p-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200", children: [
      /* @__PURE__ */ jsx("p", { className: "text-neutral-900 font-bold mb-1", children: "No active investments" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500", children: "Visit the Bond Market to start earning yield." })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold uppercase tracking-widest text-neutral-400", children: "My Investments" }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: myInvestments.map((inv) => /* @__PURE__ */ jsx(InvestmentRow, { inv, address }, inv.id)) })
  ] });
}
const portfolio = UNSAFE_withComponentProps(function PortfolioPage() {
  const {
    address
  } = useAccount();
  const bondIds = MOCK_BONDS.map((b) => BigInt(b.id));
  const accounts = MOCK_BONDS.map(() => address);
  const {
    data: balances
  } = useReadContract({
    address: CONTRACTS.BondToken.address,
    abi: CONTRACTS.BondToken.abi,
    functionName: "balanceOfBatch",
    args: address ? [accounts, bondIds] : void 0,
    query: {
      enabled: !!address,
      refetchInterval: 5e3
    }
  });
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  const totalValueLocked = React.useMemo(() => {
    if (!balances) return 0;
    const currentBalances = balances;
    return currentBalances.reduce((acc, balance) => {
      return acc + Number(formatUnits(balance, 18));
    }, 0);
  }, [balances]);
  if (!isMounted) return null;
  return /* @__PURE__ */ jsx(DashboardLayout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "space-y-10",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col gap-2",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-3xl font-black tracking-tight text-neutral-900",
          children: "Your Portfolio"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-neutral-500 font-medium italic",
          children: "Track your lending performance and asset distribution."
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 md:grid-cols-3 gap-6",
        children: [/* @__PURE__ */ jsx(StatItem, {
          title: "Total Value Locked",
          value: totalValueLocked > 0 ? `$${totalValueLocked.toLocaleString()}` : "$0",
          icon: Coins01Icon,
          trend: totalValueLocked > 0 ? {
            value: 12.5,
            isUp: true
          } : void 0,
          vibrant: true
        }), /* @__PURE__ */ jsx(StatItem, {
          title: "Cumulative Yield",
          value: "Not Integrated",
          icon: ChartBreakoutCircleIcon,
          vibrant: true
        }), /* @__PURE__ */ jsx(StatItem, {
          title: "Avg. Portfolio APR",
          value: "13.4%",
          icon: Analytics01Icon,
          vibrant: true
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "grid grid-cols-1 xl:grid-cols-2 gap-8",
        children: [/* @__PURE__ */ jsx(PerformanceChart, {}), /* @__PURE__ */ jsx(AllocationChart, {})]
      }), /* @__PURE__ */ jsx(InvestmentList, {})]
    })
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: portfolio
}, Symbol.toStringTag, { value: "Module" }));
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tabs$1.Root,
    {
      "data-slot": "tabs",
      "data-orientation": orientation,
      className: cn(
        "gap-2 group/tabs flex data-[orientation=horizontal]:flex-col",
        className
      ),
      ...props
    }
  );
}
const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-horizontal/tabs:h-8 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function TabsList({
  className,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tabs$1.List,
    {
      "data-slot": "tabs-list",
      "data-variant": variant,
      className: cn(tabsListVariants({ variant }), className),
      ...props
    }
  );
}
function TabsTrigger({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Tabs$1.Tab,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background dark:data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 data-active:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      ),
      ...props
    }
  );
}
function TabsContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Tabs$1.Panel,
    {
      "data-slot": "tabs-content",
      className: cn("text-sm flex-1 outline-none", className),
      ...props
    }
  );
}
function Avatar({
  className,
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Avatar$1.Root,
    {
      "data-slot": "avatar",
      "data-size": size,
      className: cn(
        "size-8 rounded-full after:rounded-full data-[size=lg]:size-10 data-[size=sm]:size-6 after:border-border group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten",
        className
      ),
      ...props
    }
  );
}
function AvatarImage({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Avatar$1.Image,
    {
      "data-slot": "avatar-image",
      className: cn(
        "rounded-full aspect-square size-full object-cover",
        className
      ),
      ...props
    }
  );
}
function AvatarFallback({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Avatar$1.Fallback,
    {
      "data-slot": "avatar-fallback",
      className: cn(
        "bg-muted text-muted-foreground rounded-full flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs",
        className
      ),
      ...props
    }
  );
}
function Separator({
  className,
  orientation = "horizontal",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Separator$1,
    {
      "data-slot": "separator",
      orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      ),
      ...props
    }
  );
}
function ProfileForm() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative group cursor-pointer", children: [
        /* @__PURE__ */ jsxs(Avatar, { className: "w-24 h-24 border-4 border-white shadow-lg", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: "https://github.com/shadcn.png" }),
          /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-neutral-900 text-white font-black text-2xl", children: "CN" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Camera01Icon, className: "text-white w-6 h-6" }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-neutral-900", children: "Investor Alex" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 font-medium", children: "Verified Investor" }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "mt-2 h-8 text-xs font-bold border-neutral-200", children: "Change Avatar" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Separator, { className: "bg-neutral-100" }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-5 max-w-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "displayName", className: "font-bold text-neutral-700", children: "Display Name" }),
        /* @__PURE__ */ jsx(Input, { id: "displayName", defaultValue: "Investor Alex", className: "bg-white border-neutral-200 focus:border-neutral-900 h-10 rounded-xl" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "email", className: "font-bold text-neutral-700", children: "Email Address" }),
        /* @__PURE__ */ jsx(Input, { id: "email", type: "email", defaultValue: "alex@example.com", className: "bg-neutral-50 border-neutral-200 text-neutral-500 h-10 rounded-xl", disabled: true }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-neutral-400 font-medium", children: "To change your email, please contact support." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "bio", className: "font-bold text-neutral-700", children: "Bio" }),
        /* @__PURE__ */ jsx(Input, { id: "bio", placeholder: "Tell us about your investment goals...", className: "bg-white border-neutral-200 focus:border-neutral-900 h-10 rounded-xl" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end max-w-xl pt-4", children: /* @__PURE__ */ jsx(Button, { className: "bg-neutral-900 hover:bg-black text-white font-bold rounded-xl px-6", children: "Save Changes" }) })
  ] });
}
function WalletSection() {
  const { address, isConnected, chain } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { writeContract: writeMint, data: mintHash, isPending: isMinting, error: mintError } = useWriteContract();
  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({ hash: mintHash });
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.MockUSDC.address,
    abi: CONTRACTS.MockUSDC.abi,
    functionName: "balanceOf",
    args: address ? [address] : void 0,
    query: {
      enabled: !!address,
      refetchInterval: 3e3
      // Check balance every 3s
    }
  });
  const isWrongNetwork = isConnected && chainId !== creditcoinTestnet.id;
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const handleConnect = () => {
    connect({ connector: injected() });
  };
  const handleSwitchNetwork = () => {
    switchChain({ chainId: creditcoinTestnet.id });
  };
  const handleMint = () => {
    if (!address) return;
    writeMint({
      address: CONTRACTS.MockUSDC.address,
      abi: CONTRACTS.MockUSDC.abi,
      functionName: "mint",
      args: [address, parseUnits("1000", 18)]
    });
  };
  React.useEffect(() => {
    if (isMintSuccess) {
      toast.success("1,000 MockUSDC minted successfully!");
      refetchBalance();
    }
    if (mintError) {
      toast.error(`Mint failed: ${mintError.message}`);
    }
  }, [isMintSuccess, mintError]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-neutral-900", children: "Connected Wallet" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500", children: "Manage your connected wallet for transactions." })
    ] }),
    !isConnected ? /* @__PURE__ */ jsx(Card, { className: "border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8 flex flex-col items-center justify-center text-center space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-900 mb-2", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Wallet01Icon, size: 32 }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-bold text-lg text-neutral-900", children: "No Wallet Connected" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-neutral-500 max-w-xs mx-auto", children: "Connect your wallet to view your assets and start investing in RWA bonds." })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleConnect,
          disabled: isConnecting,
          className: "bg-neutral-900 hover:bg-neutral-800 text-white font-bold h-11 px-6 rounded-xl gap-2 mt-2",
          children: isConnecting ? "Connecting..." : "Connect Wallet"
        }
      )
    ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Card, { className: "border-neutral-200 shadow-sm rounded-2xl overflow-hidden bg-white", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center text-white", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Wallet01Icon, size: 24 }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-bold text-neutral-900", children: "Wallet" }),
                /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-green-50 text-green-600 border-green-200 text-[10px] px-2 h-5 gap-1", children: [
                  /* @__PURE__ */ jsx(HugeiconsIcon, { icon: CheckmarkBadge01Icon, size: 12 }),
                  "Connected"
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-mono bg-neutral-100 text-neutral-600 px-2 py-1 rounded truncate max-w-[200px] sm:max-w-xs", children: shortAddress })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: () => disconnect(),
              variant: "outline",
              className: "border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold h-9 rounded-xl gap-2 w-full sm:w-auto",
              children: [
                /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Unlink01Icon, size: 16 }),
                "Disconnect"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "size-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: CoinsIcon, size: 16 }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-neutral-500 uppercase tracking-wider", children: "Your Balance" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-neutral-400", children: "MockUSDC (Testnet)" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-2xl font-black text-neutral-900 tracking-tight", children: balance ? Number(formatUnits(balance, 18)).toLocaleString() : "0" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-neutral-400", children: "USDC" })
          ] })
        ] })
      ] }) }),
      isWrongNetwork ? /* @__PURE__ */ jsxs("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-amber-500 mt-0.5", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Alert01Icon, size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h5", { className: "font-bold text-sm text-amber-900", children: "Wrong Network" }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-700 mt-1 mb-3", children: [
            "You are connected to an unsupported network. Please switch to ",
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: "Creditcoin Testnet" }),
            "."
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: handleSwitchNetwork,
              variant: "outline",
              size: "sm",
              className: "h-8 bg-white border-amber-200 text-amber-800 hover:bg-amber-100 font-bold text-xs",
              children: "Switch Network"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "text-green-500 mt-0.5", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Link01Icon, size: 20 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h5", { className: "font-bold text-sm text-neutral-900", children: "Network Status" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-neutral-500 mt-1", children: [
              "You are currently connected to ",
              /* @__PURE__ */ jsx("span", { className: "font-bold text-neutral-700", children: chain?.name || "Creditcoin Testnet" }),
              "."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "text-blue-500 mt-0.5", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: CoinsIcon, size: 20 }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h5", { className: "font-bold text-sm text-blue-900", children: "Testnet Faucet" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-600 mt-1", children: "Need tokens for testing? Get free MockUSDC." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleMint,
              disabled: isMinting || isMintConfirming,
              className: "bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 rounded-xl gap-2 text-xs",
              children: [
                (isMinting || isMintConfirming) && /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Loading03Icon, className: "animate-spin", size: 14 }),
                "Get 1,000 USDC"
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}
function Switch({
  className,
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Switch$1.Root,
    {
      "data-slot": "switch",
      "data-size": size,
      className: cn(
        "data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 shrink-0 rounded-full border border-transparent focus-visible:ring-[3px] aria-invalid:ring-[3px] data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        Switch$1.Thumb,
        {
          "data-slot": "switch-thumb",
          className: "bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 pointer-events-none block ring-0 transition-transform"
        }
      )
    }
  );
}
function AppearanceSection() {
  return /* @__PURE__ */ jsx("div", { className: "space-y-8 max-w-2xl", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Moon02Icon, size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "dark-mode", className: "text-base font-bold text-neutral-900 block", children: "Dark Mode" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 font-medium", children: "Use a dark theme for low-light environments." })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Switch, { id: "dark-mode" })
    ] }),
    /* @__PURE__ */ jsx("hr", { className: "border-neutral-100" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500", children: /* @__PURE__ */ jsx(HugeiconsIcon, { icon: Notification01Icon, size: 20 }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "notifications", className: "text-base font-bold text-neutral-900 block", children: "Push Notifications" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-neutral-500 font-medium", children: "Receive updates about your investments." })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Switch, { id: "notifications", defaultChecked: true })
    ] })
  ] }) });
}
const settings = UNSAFE_withComponentProps(function SettingsPage() {
  return /* @__PURE__ */ jsx(DashboardLayout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "space-y-6",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex flex-col gap-2",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-3xl font-black tracking-tight text-neutral-900",
          children: "Settings"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-neutral-500 font-medium italic",
          children: "Configure your account and platform preferences."
        })]
      }), /* @__PURE__ */ jsxs(Tabs, {
        defaultValue: "profile",
        className: "space-y-8",
        children: [/* @__PURE__ */ jsxs(TabsList, {
          className: "bg-neutral-100/50 p-1 h-auto rounded-2xl inline-flex gap-1 border border-neutral-200/60",
          children: [/* @__PURE__ */ jsxs(TabsTrigger, {
            value: "profile",
            className: "rounded-xl px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 gap-2 h-9",
            children: [/* @__PURE__ */ jsx(HugeiconsIcon, {
              icon: UserCircleIcon,
              size: 16
            }), "Profile"]
          }), /* @__PURE__ */ jsxs(TabsTrigger, {
            value: "wallet",
            className: "rounded-xl px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 gap-2 h-9",
            children: [/* @__PURE__ */ jsx(HugeiconsIcon, {
              icon: Wallet02Icon,
              size: 16
            }), "Wallet"]
          }), /* @__PURE__ */ jsxs(TabsTrigger, {
            value: "appearance",
            className: "rounded-xl px-4 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 gap-2 h-9",
            children: [/* @__PURE__ */ jsx(HugeiconsIcon, {
              icon: Settings01Icon,
              size: 16
            }), "Appearance"]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "max-w-4xl",
          children: [/* @__PURE__ */ jsx(TabsContent, {
            value: "profile",
            className: "m-0 focus-visible:outline-none",
            children: /* @__PURE__ */ jsx(ProfileForm, {})
          }), /* @__PURE__ */ jsx(TabsContent, {
            value: "wallet",
            className: "m-0 focus-visible:outline-none",
            children: /* @__PURE__ */ jsx(WalletSection, {})
          }), /* @__PURE__ */ jsx(TabsContent, {
            value: "appearance",
            className: "m-0 focus-visible:outline-none",
            children: /* @__PURE__ */ jsx(AppearanceSection, {})
          })]
        })]
      })]
    })
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: settings
}, Symbol.toStringTag, { value: "Module" }));
const bonds = sqliteTable("bonds", {
  id: text("id").primaryKey(),
  // UUID
  bondId: integer("bond_id"),
  // On-chain ID
  borrowerName: text("borrower_name").notNull(),
  region: text("region").notNull(),
  loanAmount: integer("loan_amount").notNull(),
  // USDC in local currency/units? No, USDC base.
  interestRate: integer("interest_rate").notNull(),
  // Basis points
  maturityDate: integer("maturity_date").notNull(),
  // Timestamp
  status: text("status", { enum: ["PENDING", "ACTIVE", "REPAID", "DEFAULT"] }).default("PENDING").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull()
});
const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});
const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id)
});
const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});
const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
});
const investors = sqliteTable("investors", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  // Link to auth user
  walletAddress: text("wallet_address").unique().notNull(),
  kycStatus: text("kyc_status", { enum: ["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED"] }).default("NOT_STARTED").notNull(),
  autoReinvest: integer("auto_reinvest", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at").notNull()
});
const investments = sqliteTable("investments", {
  id: text("id").primaryKey(),
  investorId: text("investor_id").references(() => investors.id).notNull(),
  bondId: text("bond_id").references(() => bonds.id).notNull(),
  tokenAmount: integer("token_amount").notNull(),
  usdcAmount: integer("usdc_amount").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  createdAt: integer("created_at").notNull()
});
const yieldDistributions = sqliteTable("yield_distributions", {
  id: text("id").primaryKey(),
  bondId: text("bond_id").references(() => bonds.id).notNull(),
  investorId: text("investor_id").references(() => investors.id).notNull(),
  yieldAmount: integer("yield_amount").notNull(),
  transactionHash: text("transaction_hash"),
  distributedAt: integer("distributed_at").notNull()
});
const repayments = sqliteTable("repayments", {
  id: text("id").primaryKey(),
  bondId: text("bond_id").references(() => bonds.id).notNull(),
  amount: integer("amount").notNull(),
  repaymentDate: integer("repayment_date").notNull(),
  oracleRequestId: text("oracle_request_id")
});
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  account,
  bonds,
  investments,
  investors,
  repayments,
  session,
  user,
  verification,
  yieldDistributions
}, Symbol.toStringTag, { value: "Module" }));
const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient({
  url,
  authToken
});
const db = drizzle(client, { schema });
const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema
  }),
  emailAndPassword: {
    enabled: true
  }
});
const action = async ({
  request
}) => {
  return auth.handler(request);
};
const loader = async ({
  request
}) => {
  return auth.handler(request);
};
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-BsyiESdu.js", "imports": ["/assets/index-BpesTnD6.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-Bbl9083-.js", "imports": ["/assets/index-BpesTnD6.js", "/assets/index-BoWXTe0l.js", "/assets/wagmi-CATNoc6M.js", "/assets/index-LOB-adgA.js"], "css": ["/assets/root-CH_YbKlk.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-3UgN4d9p.js", "imports": ["/assets/index-BpesTnD6.js", "/assets/contracts-DQP-R78Y.js", "/assets/stat-summary-BOuOK6aS.js", "/assets/bond-card-CSpubSvb.js", "/assets/index-BoWXTe0l.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/bonds": { "id": "routes/bonds", "parentId": "root", "path": "bonds", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/bonds-BzXMekEj.js", "imports": ["/assets/bonds--At0f5Q0.js", "/assets/index-BpesTnD6.js", "/assets/contracts-DQP-R78Y.js", "/assets/index-BoWXTe0l.js", "/assets/bond-card-CSpubSvb.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/portfolio": { "id": "routes/portfolio", "parentId": "root", "path": "portfolio", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/portfolio-B8Wt4nG7.js", "imports": ["/assets/index-BpesTnD6.js", "/assets/contracts-DQP-R78Y.js", "/assets/bond-card-CSpubSvb.js", "/assets/index-LOB-adgA.js", "/assets/bonds--At0f5Q0.js", "/assets/index-BoWXTe0l.js", "/assets/stat-summary-BOuOK6aS.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/settings": { "id": "routes/settings", "parentId": "root", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/settings-vIVlvc1x.js", "imports": ["/assets/index-BpesTnD6.js", "/assets/contracts-DQP-R78Y.js", "/assets/wagmi-CATNoc6M.js", "/assets/index-BoWXTe0l.js", "/assets/index-LOB-adgA.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth": { "id": "routes/auth", "parentId": "root", "path": "api/auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/auth-l0sNRNKZ.js", "imports": [], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-27bcd527.js", "version": "27bcd527", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "unstable_trailingSlashAwareDataRequests": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/bonds": {
    id: "routes/bonds",
    parentId: "root",
    path: "bonds",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/portfolio": {
    id: "routes/portfolio",
    parentId: "root",
    path: "portfolio",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/settings": {
    id: "routes/settings",
    parentId: "root",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/auth": {
    id: "routes/auth",
    parentId: "root",
    path: "api/auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  }
};
const allowedActionOrigins = false;
export {
  allowedActionOrigins,
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
