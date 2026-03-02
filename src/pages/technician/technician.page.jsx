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
    overdue: 0
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
      <div className="relative z-10 p-8">

        <h1 className="text-2xl font-semibold mb-8 tracking-wide text-blue-200">
          Dashboard Teknisi
        </h1>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="rounded-2xl p-6 bg-[#111c2e] border border-blue-500/20 shadow-lg">
            <p className="text-sm text-blue-300">Total Tugas</p>
            <h2 className="text-4xl font-bold mt-3">
              {summary.totalJobs}
            </h2>
          </div>

          <div className="rounded-2xl p-6 bg-[#111c2e] border border-yellow-500/20 shadow-lg">
            <p className="text-sm text-yellow-300">In Progress</p>
            <h2 className="text-4xl font-bold mt-3">
              {summary.inProgress}
            </h2>
          </div>

          <div className="rounded-2xl p-6 bg-[#111c2e] border border-red-500/30 shadow-lg">
            <p className="text-sm text-red-300">Ditolak (Reject)</p>
            <h2 className="text-4xl font-bold mt-3 text-red-400">
              {summary.rejected}
            </h2>
          </div>

        </div>

        {/* OVERDUE SECTION */}
        {overdueJobs.length > 0 && (
          <div className="rounded-2xl p-6 bg-[#111c2e] border border-red-500/30 shadow-xl">

            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 font-bold">
                !
              </div>
              <h3 className="text-lg font-semibold text-red-300">
                Tugas Melewati 4 Hari
              </h3>
            </div>

            <div className="space-y-6">
              {overdueJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl p-6
                             bg-gradient-to-r from-[#1a0f14] to-[#111c2e]
                             border border-red-500/40
                             hover:border-red-500/70
                             transition shadow-lg"
                >
                  <div className="flex justify-between items-start">

                    <div>
                      <span className="px-3 py-1 text-xs rounded-full 
                                       bg-red-600/30 text-red-300">
                        OVERDUE
                      </span>

                      <h2 className="text-xl font-semibold mt-4 text-red-200">
                        {job.item_name}
                      </h2>

                      <p className="text-red-300/80 mt-2">
                        {job.reported_issue}
                      </p>

                      <p className="text-sm text-red-400 mt-3">
                        {job.days_waiting} hari sejak masuk
                      </p>
                    </div>

                    <div className="text-right">
                      <button
                        onClick={() => navigate("/technician/jobs")}
                        className="text-red-400 hover:text-red-300 font-semibold"
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