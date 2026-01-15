import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Moon02Icon,
    Notification01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export function AppearanceSection() {
    return (
        <div className="space-y-8 max-w-2xl">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
                            <HugeiconsIcon icon={Moon02Icon} size={20} />
                        </div>
                        <div>
                            <Label htmlFor="dark-mode" className="text-base font-bold text-neutral-900 block">Dark Mode</Label>
                            <p className="text-xs text-neutral-500 font-medium">Use a dark theme for low-light environments.</p>
                        </div>
                    </div>
                    <Switch id="dark-mode" />
                </div>

                <hr className="border-neutral-100" />

                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
                            <HugeiconsIcon icon={Notification01Icon} size={20} />
                        </div>
                        <div>
                            <Label htmlFor="notifications" className="text-base font-bold text-neutral-900 block">Push Notifications</Label>
                            <p className="text-xs text-neutral-500 font-medium">Receive updates about your investments.</p>
                        </div>
                    </div>
                    <Switch id="notifications" defaultChecked />
                </div>
            </div>
        </div>
    );
}
