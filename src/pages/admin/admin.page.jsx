import { useEffect, useState, useMemo } from "react";
import Layout from "../../layout/servicesLayout";
import { getAdminDashboard } from "../../api/dashboard.api";
import { Link } from "react-router-dom";

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
  const [limit, setLimit] = useState(15);

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

  const filteredRecent = useMemo(() => {
    return recent
      .filter((job) =>
        ["waiting", "in_progress", "pending_verification"].includes(job.status)
      )
      .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
      .slice(0, limit);
  }, [recent, limit]);

  const getStatusClass = (status) => {
    if (status === "waiting") {
      return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
    }
    if (status === "assigned") {
      return "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30";
    }
    if (status === "in_progress") {
      return "bg-sky-500/20 text-sky-300 border border-sky-500/30";
    }
    if (status === "pending_verification") {
      return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
    }
    if (status === "pending_verifikasi_qc") {
      return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
    }
    if (status === "approved_maintenance") {
      return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
    }
    if (status === "in_sanitation") {
      return "bg-teal-500/20 text-teal-300 border border-teal-500/30";
    }
    if (status === "rejected") {
      return "bg-rose-500/20 text-rose-300 border border-rose-500/30";
    }
    if (status === "completed") {
      return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    }
    return "bg-slate-500/20 text-slate-300 border border-slate-500/30";
  };

  return (
    <Layout>
      <div className="h-full overflow-y-auto">
        <div className="min-h-screen overflow-y-auto px-3 py-4 pb-32 sm:px-0 sm:py-0 sm:pb-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">
            Dashboard Admin
          </h2>

          <div className="space-y-3 md:space-y-6">
            <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-br from-cyan-500/60 via-sky-500/15 to-blue-600/70 border border-white/10 shadow-lg shadow-black/30">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl bg-gradient-to-br from-cyan-400 to-blue-500">
                  🛠
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Maintenance
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur rounded-lg px-3 sm:px-4 py-3 flex items-center justify-between gap-3 min-w-0">
                  <span className="text-[11px] sm:text-xs text-slate-200 leading-snug">
                    Servis Masuk Hari Ini
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-white shrink-0">
                    {summary.serviceToday || 0}
                  </span>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg px-3 sm:px-4 py-3 flex items-center justify-between gap-3 min-w-0">
                  <span className="text-[11px] sm:text-xs text-slate-200 leading-snug">
                    In Progress
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-white shrink-0">
                    {summary.inProgress || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-6">
              <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-br from-amber-500/60 via-orange-500/15 to-yellow-600/70 border border-white/10 shadow-lg shadow-black/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl bg-gradient-to-br from-amber-400 to-yellow-500">
                    🧴
                  </div>

                  <h3 className="text-sm sm:text-lg font-semibold text-white">
                    Sanitasi
                  </h3>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg px-3 sm:px-4 py-3 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-[10px] sm:text-xs text-slate-200 leading-snug">
                    Diproses Hari Ini
                  </span>
                  <span className="text-xl sm:text-3xl font-bold text-white shrink-0">
                    {summary.sanitationToday || 0}
                  </span>
                </div>
              </div>

              <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-br from-indigo-500/60 via-violet-500/15 to-purple-600/70 border border-white/10 shadow-lg shadow-black/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl bg-gradient-to-br from-indigo-400 to-purple-500">
                    ✔
                  </div>

                  <h3 className="text-sm sm:text-lg font-semibold text-white">
                    QC
                  </h3>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-lg px-3 sm:px-4 py-3 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-[10px] sm:text-xs text-slate-200 leading-snug">
                    Pending QC
                  </span>
                  <span className="text-xl sm:text-3xl font-bold text-white shrink-0">
                    {summary.pendingQC || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-10">
            <div className="xl:col-span-2 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-4 border-b border-slate-700 gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Aktivitas Servis Terbaru
                </h3>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="bg-slate-800 text-white text-xs sm:text-sm px-3 py-1.5 rounded border border-slate-600"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>

                  <Link
                    to="/admin/penerimaan-service"
                    className="text-cyan-400 text-xs sm:text-sm hover:underline whitespace-nowrap"
                  >
                    Lihat Semua
                  </Link>
                </div>
              </div>

              <div className="md:hidden p-3 space-y-3">
                {filteredRecent.length === 0 ? (
                  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm text-slate-400">
                    Belum ada aktivitas servis.
                  </div>
                ) : (
                  filteredRecent.map((job, i) => (
                    <div
                      key={i}
                      className="bg-slate-800/70 border border-slate-700 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-white break-words leading-snug">
                            {job.item_name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            Teknisi: {job.technician_name || "-"}
                          </p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-medium capitalize whitespace-nowrap ${getStatusClass(
                            job.status
                          )}`}
                        >
                          {job.status.replaceAll("_", " ")}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 break-words leading-relaxed">
                        {job.reported_issue}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="hidden md:block overflow-x-auto">
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
                    {filteredRecent.map((job, i) => (
                      <tr key={i} className="hover:bg-slate-800/60 transition">
                        <td className="px-6 py-4 font-medium text-white">
                          {job.item_name}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {job.reported_issue}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                              job.status
                            )}`}
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

            <div className="space-y-4 md:space-y-6">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4 text-white">
                  Top Teknisi Bulan Ini
                </h3>

                <div className="space-y-3 sm:space-y-4">
                  {topTech.map((tech, i) => {
                    const medal =
                      i === 0 ? "🥇" :
                      i === 1 ? "🥈" :
                      i === 2 ? "🥉" : "";

                    const max = topTech[0]?.total_completed || 1;
                    const percent = (tech.total_completed / max) * 100;

                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center text-xs sm:text-sm mb-1 gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span>{medal}</span>
                            <span className="text-white font-medium break-words">
                              {tech.nama}
                            </span>
                          </div>

                          <span className="text-emerald-400 font-semibold whitespace-nowrap">
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

              <div className="bg-gradient-to-br from-rose-500/15 to-rose-700/10 border border-rose-500/40 rounded-xl p-4 sm:p-6 shadow-lg shadow-rose-900/20">
                <h3 className="text-base sm:text-lg font-semibold text-rose-400 mb-4">
                  ⚠ Servis Lebih Dari 4 Hari
                </h3>

                {overdueJobs.length === 0 ? (
                  <p className="text-sm text-slate-300">
                    Tidak ada servis yang melewati 4 hari.
                  </p>
                ) : (
                  <div className="space-y-3 md:max-h-[240px] md:overflow-y-auto md:pr-1 md:pb-4">
                    {overdueJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-slate-900/80 border border-rose-500/20 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <span className="font-semibold text-white break-words">
                            {job.item_name}
                          </span>

                          <span className="text-sm font-bold text-rose-400 whitespace-nowrap">
                            {job.days_waiting} hari
                          </span>
                        </div>

                        <div className="text-sm text-slate-400 mt-1 break-words">
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
        </div>
      </div>
    </Layout>
  );
}