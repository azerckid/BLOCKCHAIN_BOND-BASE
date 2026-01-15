import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon } from "@hugeicons/core-free-icons";

export function ProfileForm() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6">
                <div className="relative group cursor-pointer">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback className="bg-neutral-900 text-white font-black text-2xl">CN</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <HugeiconsIcon icon={Camera01Icon} className="text-white w-6 h-6" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-neutral-900">Investor Alex</h3>
                    <p className="text-sm text-neutral-500 font-medium">Verified Investor</p>
                    <Button variant="outline" size="sm" className="mt-2 h-8 text-xs font-bold border-neutral-200">
                        Change Avatar
                    </Button>
                </div>
            </div>

            <Separator className="bg-neutral-100" />

            <div className="grid gap-5 max-w-xl">
                <div className="grid gap-2">
                    <Label htmlFor="displayName" className="font-bold text-neutral-700">Display Name</Label>
                    <Input id="displayName" defaultValue="Investor Alex" className="bg-white border-neutral-200 focus:border-neutral-900 h-10 rounded-xl" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email" className="font-bold text-neutral-700">Email Address</Label>
                    <Input id="email" type="email" defaultValue="alex@example.com" className="bg-neutral-50 border-neutral-200 text-neutral-500 h-10 rounded-xl" disabled />
                    <p className="text-[11px] text-neutral-400 font-medium">To change your email, please contact support.</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="bio" className="font-bold text-neutral-700">Bio</Label>
                    <Input id="bio" placeholder="Tell us about your investment goals..." className="bg-white border-neutral-200 focus:border-neutral-900 h-10 rounded-xl" />
                </div>
            </div>

            <div className="flex justify-end max-w-xl pt-4">
                <Button className="bg-neutral-900 hover:bg-black text-white font-bold rounded-xl px-6">
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
