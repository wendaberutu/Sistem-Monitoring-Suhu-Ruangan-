import { useEffect, useState } from "react";
import Layout from "../../layout/servicesLayout";
import { getAdminDashboard } from "../../api/dashboard.api";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    serviceToday: 0,
    inProgress: 0,
    readyPickup: 0,
    completedToday: 0,
  });
const [recent, setRecent] = useState([]);
const [topTech, setTopTech] = useState([]);
const [overdue, setOverdue] = useState(0);
  useEffect(() => {
    fetchDashboard();
  }, []);

const fetchDashboard = async () => {
  try {
    const res = await getAdminDashboard();
    const data = res.data.data;

    setSummary(data.summary);
    setRecent(data.recent || []);
    setTopTech(data.topTechnicians || []);
    setOverdue(data.summary?.overdueJobs || 0);
  } catch (err) {
    console.error("Dashboard error:", err);
  }
};
  const stats = [
    {
      title: "Servis Masuk",
      subtitle: "Hari ini",
      value: summary.serviceToday,
      bg: "from-cyan-500/60 via-sky-500/15 to-blue-600/70",
      iconBg: "from-cyan-400 to-blue-500",
      icon: "📥",
    },
    {
      title: "Proses Pengerjaan",
      value: summary.inProgress,
      bg: "from-amber-500/60 via-orange-500/15 to-yellow-600/70",
      iconBg: "from-amber-400 to-yellow-500",
      icon: "⚙️",
    },
    {
      title: "Servis Bisa Diambil",
      value: summary.readyPickup,
      bg: "from-emerald-500/60 via-green-500/15 to-emerald-600/70",
      iconBg: "from-emerald-400 to-green-500",
      icon: "📦",
    },
    {
      title: "Servis Selesai",
      subtitle: "Hari ini",
      value: summary.completedToday,
      bg: "from-rose-500/60 via-pink-500/15 to-red-600/70",
      iconBg: "from-rose-400 to-red-500",
      icon: "✅",
    },
  ];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-white">
        Dashboard Admin
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`rounded-xl p-4 flex items-center gap-4
              bg-gradient-to-br ${s.bg}
              border border-white/10
              shadow-lg shadow-black/30`}
          >
            <div
              className={`w-14 h-14 rounded-xl
                flex items-center justify-center
                text-white text-2xl
                bg-gradient-to-br ${s.iconBg}`}
            >
              {s.icon}
            </div>

            <div className="flex-1">
              <div className="text-sm text-slate-200">
                {s.title}{" "}
                {s.subtitle && (
                  <span className="font-semibold text-white">
                    {s.subtitle}
                  </span>
                )}
              </div>

              <div className="text-3xl font-bold text-white mt-1">
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== SECTION BAWAH ===== */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">

  {/* ===== LEFT: AKTIVITAS TERBARU ===== */}
  <div className="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-xl p-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold">
        Aktivitas Servis Terbaru
      </h3>
      <span className="text-cyan-400 text-sm cursor-pointer">
        Lihat Semua
      </span>
    </div>

    <div className="space-y-4">
      {recent.map((job, i) => (
        <div
          key={i}
          className="flex justify-between items-center bg-slate-800 rounded-lg p-4"
        >
          <div>
            <div className="font-semibold">
              {job.item_name}
            </div>
            <div className="text-sm text-gray-400">
              {job.reported_issue}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              job.status === "completed"
                ? "bg-emerald-500/20 text-emerald-300"
                : job.status === "in_progress"
                ? "bg-amber-500/20 text-amber-300"
                : job.status === "pending_verification"
                ? "bg-indigo-500/20 text-indigo-300"
                : "bg-slate-500/20 text-slate-300"
            }`}>
              {job.status.replace("_", " ")}
            </span>

            <span className="text-sm text-gray-300">
              {job.technician_name || "-"}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* ===== RIGHT SIDE ===== */}
  <div className="space-y-6">

    {/* TOP TEKNISI */}
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">
        Top Teknisi
      </h3>

      <div className="space-y-3">
        {topTech.map((tech, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span>{tech.nama}</span>
            <span className="text-emerald-400 font-medium">
              {tech.total} selesai
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* BUTUH PERHATIAN */}
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-rose-400 mb-3">
        Butuh Perhatian!
      </h3>

      <p className="text-sm text-gray-300 mb-4">
        Ada {overdue} servis yang melewati batas waktu SLA.
      </p>

      <button className="w-full bg-rose-500 hover:bg-rose-600 transition rounded-lg py-2 font-medium">
        Tinjau Sekarang
      </button>
    </div>

  </div>
</div>
    </Layout>
  );
}