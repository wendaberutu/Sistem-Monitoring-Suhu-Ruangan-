import { useEffect, useState } from "react";
import Layout from "../../layout/servicesLayout";
import JobDetailModal from "./JobDetailModal";
import { getMyJobs } from "../../api/servicesJob.api";

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ["Semua", "Sedang Berjalan", "Pending"];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await getMyJobs();
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Sedang Berjalan") return job.status === "in_progress";
    if (activeTab === "Pending") return job.status === "pending_verification";
    return true;
  });

  return (
    <Layout variant="technician">
      <div className="min-h-screen w-full text-white relative overflow-hidden px-3 py-4 sm:px-4 sm:py-6 md:px-10 md:py-10">
        <div
          className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.08),transparent_40%)]"
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-5 md:mb-10">
            Tugas Saya
          </h1>

          <div className="flex flex-wrap gap-2 mb-5 md:mb-10">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-blue-600 shadow-md shadow-blue-500/30 text-white"
                    : "text-blue-200 hover:bg-blue-500/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-blue-300/60">Memuat data...</p>
          ) : filteredJobs.length === 0 ? (
            <p className="text-blue-300/60">Tidak ada tugas.</p>
          ) : (
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl p-4 sm:p-5 md:p-6
                  bg-gradient-to-r from-[#111c2e] to-[#0b1325]
                  border border-blue-500/30
                  hover:border-blue-500/60 transition"
                >
                  <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-6">
                    <div className="flex-1 min-w-0">
                      <span
                        className={`inline-flex px-3 py-1 text-[11px] sm:text-xs rounded-full whitespace-nowrap ${
                          job.status === "in_progress"
                            ? "bg-blue-600/30 text-blue-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {job.status.replaceAll("_", " ").toUpperCase()}
                      </span>

                      <h2 className="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 break-words leading-snug">
                        {job.item_name}
                      </h2>

                      <p className="text-sm sm:text-base text-blue-200/70 mt-1 break-words">
                        {job.nama_penyetor}
                      </p>

                      <p className="text-blue-300/60 text-xs sm:text-sm mt-3 break-all">
                        {job.id}
                      </p>

                      {job.last_reject_note && job.status === "in_progress" && (
                        <div className="mt-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                          <p className="text-red-400 text-sm font-semibold">
                            Ditolak oleh Verifier
                          </p>
                          <p className="text-red-300/80 text-sm mt-1 break-words leading-relaxed">
                            {job.last_reject_note.replace(
                              "VERIFIKASI DITOLAK: ",
                              ""
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex md:items-start md:justify-end">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="w-full sm:w-auto text-left md:text-right text-blue-400 hover:text-blue-300 font-semibold text-sm sm:text-base"
                      >
                        Lihat Detail →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => {
              setSelectedJob(null);
              fetchJobs();
            }}
          />
        )}
      </div>
    </Layout>
  );
}