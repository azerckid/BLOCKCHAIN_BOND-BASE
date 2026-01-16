import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { WalletSection } from "@/components/settings/wallet-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserCircleIcon,
    Wallet02Icon,
    Settings01Icon
} from "@hugeicons/core-free-icons";

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-neutral-900">Settings</h1>
                    <p className="text-neutral-500 font-medium italic">Configure your account and platform preferences.</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-8">
                    <TabsList className="bg-neutral-100/50 p-1 h-auto rounded-2xl inline-flex gap-1 border border-neutral-200/60">
                        <TabsTrigger
                            value="profile"
                            className="rounded-xl px-4 py-2 text-sm font-bold data-active:bg-white data-active:text-neutral-900 data-active:shadow-sm text-neutral-500 gap-2 h-9"
                        >
                            <HugeiconsIcon icon={UserCircleIcon} size={16} />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="wallet"
                            className="rounded-xl px-4 py-2 text-sm font-bold data-active:bg-white data-active:text-neutral-900 data-active:shadow-sm text-neutral-500 gap-2 h-9"
                        >
                            <HugeiconsIcon icon={Wallet02Icon} size={16} />
                            Wallet
                        </TabsTrigger>
                        <TabsTrigger
                            value="appearance"
                            className="rounded-xl px-4 py-2 text-sm font-bold data-active:bg-white data-active:text-neutral-900 data-active:shadow-sm text-neutral-500 gap-2 h-9"
                        >
                            <HugeiconsIcon icon={Settings01Icon} size={16} />
                            Appearance
                        </TabsTrigger>
                    </TabsList>

                    <div className="max-w-4xl">
                        <TabsContent value="profile" className="m-0 focus-visible:outline-none">
                            <ProfileForm />
                        </TabsContent>

                        <TabsContent value="wallet" className="m-0 focus-visible:outline-none">
                            <WalletSection />
                        </TabsContent>

                        <TabsContent value="appearance" className="m-0 focus-visible:outline-none">
                            <AppearanceSection />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
