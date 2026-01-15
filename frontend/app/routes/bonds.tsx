import * as React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BondCard, type BondProps } from "@/components/bonds/bond-card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Search01Icon,
    FilterIcon,
    Sorting03Icon
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFetcher, type ActionFunctionArgs } from "react-router";
import { toast } from "sonner";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const amount = formData.get("amount");
    const bondId = formData.get("bondId");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In a real app, we would write to DB and blockchain here
    return { success: true, amount, bondId };
}

export const MOCK_BONDS: BondProps[] = [
    {
        id: "1",
        title: "SME Working Capital - Bangkok",
        description: "Supporting local retail businesses in the heart of Thailand.",
        apr: 12.5,
        term: "12 Months",
        location: "Bangkok, Thailand",
        totalAmount: "$5.0M",
        remainingAmount: "$1.2M",
        status: "active",
        category: "Real Estate",
    },
    {
        id: "2",
        title: "Agriculture Supply Chain",
        description: "Post-harvest financing for rice farmers in Northern provinces.",
        apr: 14.2,
        term: "6 Months",
        location: "Chiang Mai, Thailand",
        totalAmount: "$2.0M",
        remainingAmount: "$0.4M",
        status: "active",
        category: "Agriculture",
    },
    {
        id: "3",
        title: "Clean Energy Infrastructure",
        description: "Solar panel installation for suburban community centers.",
        apr: 11.8,
        term: "24 Months",
        location: "Phuket, Thailand",
        totalAmount: "$8.5M",
        remainingAmount: "$3.1M",
        status: "active",
        category: "Energy",
    },
    {
        id: "4",
        title: "Logistics Fleet Expansion",
        description: "Financing for electric delivery vehicles in urban areas.",
        apr: 13.5,
        term: "18 Months",
        location: "Bangkok, Thailand",
        totalAmount: "$3.5M",
        remainingAmount: "$2.8M",
        status: "active",
        category: "Logistics",
    },
    {
        id: "5",
        title: "Fishery Modernization",
        description: "Sustainable fishing equipment and cold storage facilities.",
        apr: 15.0,
        term: "12 Months",
        location: "Rayong, Thailand",
        totalAmount: "$1.5M",
        remainingAmount: "$0.1M",
        status: "active",
        category: "Agriculture",
    }
];

const CATEGORIES = ["All", "Real Estate", "Agriculture", "Energy", "Logistics"];

export default function BondsPage() {
    const [selectedCategory, setSelectedCategory] = React.useState("All");
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredBonds = MOCK_BONDS.filter(bond => {
        const matchesCategory = selectedCategory === "All" || bond.category === selectedCategory;
        const matchesSearch = bond.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bond.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-neutral-900">Bond Market</h1>
                        <p className="text-neutral-500 font-medium italic">Discover high-yield real-world assets on Creditcoin.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative w-full md:w-64">
                            <HugeiconsIcon
                                icon={Search01Icon}
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                            />
                            <Input
                                placeholder="Search by name or location..."
                                className="pl-10 rounded-xl bg-white border-neutral-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="rounded-xl border-neutral-200">
                            <HugeiconsIcon icon={FilterIcon} size={18} />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl border-neutral-200">
                            <HugeiconsIcon icon={Sorting03Icon} size={18} />
                        </Button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                                selectedCategory === category
                                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-200"
                                    : "text-neutral-500 hover:bg-neutral-100"
                            )}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Bonds Grid */}
                {filteredBonds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredBonds.map((bond) => (
                            <BondCard key={bond.id} bond={bond} />
                        ))}
                    </div>
                ) : (
                    <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4 bg-white border border-dashed border-neutral-200 rounded-3xl">
                        <div className="p-4 bg-neutral-50 rounded-full text-neutral-300">
                            <HugeiconsIcon icon={Search01Icon} size={48} />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-neutral-900">No bonds found</p>
                            <p className="text-sm text-neutral-500">Try adjusting your search or filters.</p>
                        </div>
                        <Button variant="link" onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}>
                            Clear all filters
                        </Button>
                    </div>
                )}

                {/* Market Stats Footer */}
                <div className="pt-10 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-8">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Total Market Cap</p>
                            <p className="text-xl font-black text-neutral-900">$242.8M</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Avg. Market APR</p>
                            <p className="text-xl font-black text-neutral-900">12.8%</p>
                        </div>
                    </div>
                    <p className="text-xs text-neutral-400 italic">Data updated real-time from Creditcoin Universal Oracle</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
