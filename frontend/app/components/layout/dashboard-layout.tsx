import * as React from "react";
import { NavLink, Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Home01Icon,
    Database01Icon,
    Wallet01Icon,
    Settings02Icon,
    Logout01Icon,
    Notification01Icon,
    Menu01Icon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItemProps {
    to: string;
    icon: any; // Hugeicons icon data
    label: string;
    onClick?: () => void;
}

const NavItem = ({ to, icon, label, onClick }: NavItemProps) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                        ? "bg-neutral-900 text-white shadow-lg shadow-neutral-200"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                )
            }
        >
            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                <HugeiconsIcon icon={icon} size={24} />
            </span>
            <span className="font-medium">{label}</span>
        </NavLink>
    );
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const navigation = [
        { to: "/", icon: Home01Icon, label: "Dashboard" },
        { to: "/bonds", icon: Database01Icon, label: "Bond Market" },
        { to: "/portfolio", icon: Wallet01Icon, label: "My Portfolio" },
        { to: "/settings", icon: Settings02Icon, label: "Settings" },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-bottom border-neutral-100 italic">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-neutral-900">BuildCTC</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavItem
                            key={item.to}
                            {...item}
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    ))}
                </nav>

                {/* Bottom Profile/Logout */}
                <div className="p-4 border-t border-neutral-100 mt-auto space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white shadow-sm overflow-hidden animate-pulse" />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-neutral-900 truncate">Investor Alex</p>
                            <p className="text-xs text-neutral-500 truncate">alex@example.com</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 py-6">
                        <HugeiconsIcon icon={Logout01Icon} size={24} />
                        <span className="font-medium">Sign Out</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 border-b border-neutral-200/50">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <HugeiconsIcon icon={Menu01Icon} size={24} />
                        </Button>
                        <h2 className="text-lg font-semibold text-neutral-900">
                            {/* Dynamic title could go here */}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden sm:flex items-center bg-neutral-100 rounded-full px-4 py-1.5 border border-neutral-200">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                            <span className="text-xs font-medium text-neutral-600">Creditcoin Mainnet</span>
                        </div>

                        <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:text-neutral-900">
                            <HugeiconsIcon icon={Notification01Icon} size={24} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </Button>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
