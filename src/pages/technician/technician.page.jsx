import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../layout/servicesLayout";
import { getTechnicianDashboard } from "../../api/dashboard.api";

export default function TechnicianDashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalJobs: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    overdue: 0,
  });

  const [overdueJobs, setOverdueJobs] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getTechnicianDashboard();
      const data = res.data.data;

      setSummary(data.summary || {});
      setOverdueJobs(data.overdueJobs || []);
    } catch (err) {
      console.error("Technician dashboard error:", err);
    }
  };

  return (
    <Layout variant="technician">
      <div className="relative z-10">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 md:mb-8 tracking-wide text-blue-200">
          Dashboard Teknisi
        </h1>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-6 md:mb-10">
          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 bg-[#111c2e] border border-blue-500/20 shadow-lg text-center">
            <p className="text-[10px] sm:text-sm text-blue-300 leading-tight">
              Total Tugas
            </p>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-3">
              {summary.totalJobs}
            </h2>
          </div>

          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 bg-[#111c2e] border border-yellow-500/20 shadow-lg text-center">
            <p className="text-[10px] sm:text-sm text-yellow-300 leading-tight">
              In Progress
            </p>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-3">
              {summary.inProgress}
            </h2>
          </div>

          <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 bg-[#111c2e] border border-red-500/30 shadow-lg text-center">
            <p className="text-[10px] sm:text-sm text-red-300 leading-tight">
              Ditolak
            </p>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mt-1 sm:mt-3 text-red-400">
              {summary.rejected}
            </h2>
          </div>
        </div>

        {overdueJobs.length > 0 && (
          <div className="rounded-2xl p-4 sm:p-5 md:p-6 bg-[#111c2e] border border-red-500/30 shadow-xl">
            <div className="flex items-start sm:items-center gap-3 mb-5 sm:mb-6 md:mb-8">
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 font-bold shrink-0">
                !
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-red-300 leading-snug">
                Tugas Melewati 4 Hari
              </h3>
            </div>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {overdueJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl p-4 sm:p-5 md:p-6
                  bg-gradient-to-r from-[#1a0f14] to-[#111c2e]
                  border border-red-500/40
                  hover:border-red-500/70
                  transition shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <span
                        className="inline-flex px-3 py-1 text-[11px] sm:text-xs rounded-full 
                        bg-red-600/30 text-red-300 whitespace-nowrap"
                      >
                        OVERDUE
                      </span>

                      <h2 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 text-red-200 break-words leading-snug">
                        {job.item_name}
                      </h2>

                      <p className="text-sm sm:text-base text-red-300/80 mt-2 break-words leading-relaxed">
                        {job.reported_issue}
                      </p>

                      <p className="text-xs sm:text-sm text-red-400 mt-3">
                        {job.days_waiting} hari sejak masuk
                      </p>
                    </div>

                    <div className="flex md:justify-end">
                      <button
                        onClick={() => navigate("/technician/jobs")}
                        className="w-full sm:w-auto text-left md:text-right text-red-400 hover:text-red-300 font-semibold text-sm sm:text-base"
                      >
                        Lihat Detail →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}