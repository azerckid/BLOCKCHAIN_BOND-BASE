import { Link } from "react-router";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function NotFound() {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <p className="text-7xl font-bold text-neutral-200">404</p>
                <h1 className="mt-4 text-2xl font-bold text-neutral-900">
                    페이지를 찾을 수 없습니다
                </h1>
                <p className="mt-2 text-neutral-500">
                    요청하신 페이지가 존재하지 않거나 이동되었습니다.
                </p>
                <Link
                    to="/"
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
                >
                    홈으로 돌아가기
                </Link>
            </div>
        </DashboardLayout>
    );
}
