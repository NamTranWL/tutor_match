import Link from "next/link";

export default async function PublicHome() {
  return (
    <main className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
      <section className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">TutorMatch</h1>
        <p className="mt-4 text-slate-600">
          Nền tảng kết nối Phụ huynh và Gia sư. Khám phá – Đặt lịch – Theo dõi
          chất lượng học tập một cách minh bạch và tiện lợi.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/login`}
            className="px-5 py-3 rounded-2xl shadow-sm border border-slate-200 hover:bg-slate-100 transition"
          >
            Login
          </Link>
          <Link
            href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/register`}
            className="px-5 py-3 rounded-2xl shadow-sm bg-black text-white hover:opacity-90 transition"
          >
            Register
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-2xl border border-slate-200">
            <h3 className="font-semibold">Tìm Gia sư nhanh</h3>
            <p className="text-sm text-slate-600 mt-1">
              Lọc theo môn, ngân sách, lịch trống và hình thức học.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200">
            <h3 className="font-semibold">Lịch học trực quan</h3>
            <p className="text-sm text-slate-600 mt-1">
              Đồng bộ lịch – đặt buổi học chỉ với vài thao tác.
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200">
            <h3 className="font-semibold">Theo dõi kết quả</h3>
            <p className="text-sm text-slate-600 mt-1">
              Báo cáo tiến bộ định kỳ cho phụ huynh và học viên.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
