import { useEffect, useState } from "react";
import Layout from "../../layout/servicesLayout";
import { getAdminDashboard } from "../../api/dashboard.api";

export default function AdminDashboard() {

  const [summary, setSummary] = useState({
    serviceToday: 0,
    inProgress: 0,
    sanitationToday: 0,
    pendingQC: 0,
  });

  const [recent, setRecent] = useState([]);
  const [topTech, setTopTech] = useState([]);
  const [overdueJobs, setOverdueJobs] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {

      const res = await getAdminDashboard();
      const data = res.data.data;

      setSummary(data.summary || {});
      setRecent(data.activities || []);
      setTopTech(data.topTechnicians || []);
      setOverdueJobs(data.overdueJobs || []);

    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  const stats = [
    {
      title: "Maintenance",
      bg: "from-cyan-500/60 via-sky-500/15 to-blue-600/70",
      iconBg: "from-cyan-400 to-blue-500",
      icon: "🛠",
      items: [
        { label: "Servis Masuk Hari Ini", value: summary.serviceToday },
        { label: "In Progress", value: summary.inProgress }
      ]
    },
    {
      title: "Sanitasi",
      bg: "from-amber-500/60 via-orange-500/15 to-yellow-600/70",
      iconBg: "from-amber-400 to-yellow-500",
      icon: "🧴",
      items: [
        { label: "Sanitasi Diproses Hari Ini", value: summary.sanitationToday }
      ]
    },
    {
      title: "QC",
      bg: "from-indigo-500/60 via-violet-500/15 to-purple-600/70",
      iconBg: "from-indigo-400 to-purple-500",
      icon: "✔",
      items: [
        { label: "Pending QC", value: summary.pendingQC }
      ]
    }
  ];

  return (
    <Layout>

      <h2 className="text-2xl font-bold mb-6 text-white">
        Dashboard Admin
      </h2>

      {/* ===== SUMMARY ===== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {stats.map((s, i) => (

          <div
            key={i}
            className={`rounded-xl p-5 bg-gradient-to-br ${s.bg} border border-white/10 shadow-lg shadow-black/30`}
          >

            <div className="flex items-center gap-3 mb-4">

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl bg-gradient-to-br ${s.iconBg}`}
              >
                {s.icon}
              </div>

              <h3 className="text-lg font-semibold text-white">
                {s.title}
              </h3>

            </div>

            <div className="flex gap-3">

              {s.items.map((item, idx) => (

                <div
                  key={idx}
                  className="flex-1 bg-white/10 backdrop-blur rounded-lg px-4 py-3 flex items-center justify-between"
                >

                  <span className="text-xs text-slate-200">
                    {item.label}
                  </span>

                  <span className="text-3xl font-bold text-white">
                    {item.value || 0}
                  </span>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

      {/* ===== SECTION BAWAH ===== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-10">

        {/* ===== LEFT ===== */}

        <div className="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">

          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700">

            <h3 className="text-lg font-semibold">
              Aktivitas Servis Terbaru
            </h3>

            <span className="text-cyan-400 text-sm cursor-pointer hover:underline">
              Lihat Semua
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-800 text-slate-400 uppercase text-xs tracking-wider">

                <tr>
                  <th className="text-left px-6 py-3">Item</th>
                  <th className="text-left px-6 py-3">Masalah</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Teknisi</th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800">

                {recent.map((job, i) => (

                  <tr key={i} className="hover:bg-slate-800/60 transition">

                    <td className="px-6 py-4 font-medium text-white">
                      {job.item_name}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {job.reported_issue}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : job.status === "in_progress"
                            ? "bg-amber-500/20 text-amber-300"
                            : job.status === "pending_verification"
                            ? "bg-indigo-500/20 text-indigo-300"
                            : job.status === "assigned"
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-slate-500/20 text-slate-300"
                        }`}
                      >

                        {job.status.replaceAll("_", " ")}

                      </span>

                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {job.technician_name || "-"}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* ===== RIGHT SIDE ===== */}

        <div className="space-y-6">

          {/* ===== TOP TEKNISI ===== */}

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">

            <h3 className="text-lg font-semibold mb-4">
              Top Teknisi Bulan Ini
            </h3>

            <div className="space-y-4">

              {topTech.map((tech, i) => {

                const medal =
                  i === 0 ? "🥇" :
                  i === 1 ? "🥈" :
                  i === 2 ? "🥉" : "";

                const max = topTech[0]?.total_completed || 1;

                const percent = (tech.total_completed / max) * 100;

                return (

                  <div key={i}>

                    <div className="flex justify-between items-center text-sm mb-1">

                      <div className="flex items-center gap-2">

                        <span>{medal}</span>

                        <span className="text-white font-medium">
                          {tech.nama}
                        </span>

                      </div>

                      <span className="text-emerald-400 font-semibold">
                        {tech.total_completed} selesai
                      </span>

                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2">

                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />

                    </div>

                  </div>

                );

              })}

              {topTech.length === 0 && (
                <div className="text-slate-400 text-sm">
                  Belum ada data bulan ini.
                </div>
              )}

            </div>

          </div>

          {/* ===== OVERDUE ===== */}

          <div className="bg-gradient-to-br from-rose-500/15 to-rose-700/10 border border-rose-500/40 rounded-xl p-6 shadow-lg shadow-rose-900/20">

            <h3 className="text-lg font-semibold text-rose-400 mb-4">
              ⚠ Servis Lebih Dari 4 Hari
            </h3>

            {overdueJobs.length === 0 ? (

              <p className="text-sm text-slate-300">
                Tidak ada servis yang melewati 4 hari.
              </p>

            ) : (

              <div className="space-y-3 max-h-64 overflow-y-auto">

                {overdueJobs.map((job) => (

                  <div
                    key={job.id}
                    className="bg-slate-900/80 border border-rose-500/20 rounded-lg p-4"
                  >

                    <div className="flex justify-between items-center">

                      <span className="font-semibold text-white">
                        {job.item_name}
                      </span>

                      <span className="text-sm font-bold text-rose-400">
                        {job.days_waiting} hari
                      </span>

                    </div>

                    <div className="text-sm text-slate-400 mt-1">
                      {job.reported_issue}
                    </div>

                    <div className="text-xs text-slate-500 mt-2">
                      Teknisi: {job.technician_name || "-"}
                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </Layout>
  );
}