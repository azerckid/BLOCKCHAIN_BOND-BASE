import { Link } from "react-router";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export function meta() {
    return [{ title: "페이지를 찾을 수 없습니다 | BondBase" }];
}

export default function NotFound() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <h1 className="text-4xl font-black text-neutral-900 tracking-tight">404</h1>
                <p className="mt-4 text-neutral-600 font-medium">페이지를 찾을 수 없습니다.</p>
                <p className="mt-2 text-sm text-neutral-500">요청하신 주소가 잘못되었거나 페이지가 이동되었을 수 있습니다.</p>
                <Link
                    to="/"
                    className="mt-8 inline-flex items-center justify-center rounded-xl bg-neutral-900 px-6 py-3 text-sm font-bold text-white hover:bg-neutral-800 transition-colors"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        </DashboardLayout>
    );
}
