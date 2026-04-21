import { useEffect, useState, useMemo } from "react";
import Layout from "../../layout/servicesLayout";
import { getPendingVerification, verifyJob } from "../../api/servicesJob.api";
import RejectModal from "./RejectModal";

export default function VerifierJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectJob, setRejectJob] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    const res = await getPendingVerification();
    setJobs(res.data.data);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApprove = async () => {
    if (!selectedJob || loading) return;

    try {
      setLoading(true);
      await verifyJob(selectedJob.id, "approved");
      setSelectedJob(null);
      await fetchJobs();
    } catch (err) {
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    return {
      pendingNormal: jobs.filter((job) => !job.is_damaged).length,
      pendingDamaged: jobs.filter((job) => !!job.is_damaged).length,
      approved: 0,
      rejected: 0,
    };
  }, [jobs]);

  return (
    <Layout variant="verifier">
      <div>
        <h1 className="text-xl md:text-3xl font-semibold mb-4 md:mb-8">
          Verifikasi Pekerjaan
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
          <div className="rounded-2xl p-3 md:p-6 bg-gradient-to-br from-[#0b1325] to-[#020617] border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <p className="text-blue-300 text-xs md:text-sm">MENUNGGU</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2">{summary.pendingNormal}</h2>
            <p className="text-xs text-yellow-400 mt-2 hidden sm:block">
              ● Verifikasi normal
            </p>
          </div>

          <div className="rounded-2xl p-3 md:p-6 bg-gradient-to-br from-[#2a0b0b] to-[#120404] border border-red-500/30 shadow-lg shadow-red-500/10">
            <p className="text-red-300 text-xs md:text-sm">RUSAK</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 text-red-400">
              {summary.pendingDamaged}
            </h2>
            <p className="text-xs text-red-300 mt-2 hidden sm:block">
              ● Perlu keputusan rusak
            </p>
          </div>

          <div className="rounded-2xl p-3 md:p-6 bg-gradient-to-br from-[#0b1325] to-[#020617] border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <p className="text-blue-300 text-xs md:text-sm">DISETUJUI</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 text-green-400">
              {summary.approved}
            </h2>
            <p className="text-xs text-green-400 mt-2 hidden sm:block">
              ✓ Sudah diverifikasi
            </p>
          </div>

          <div className="rounded-2xl p-3 md:p-6 bg-gradient-to-br from-[#0b1325] to-[#020617] border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <p className="text-blue-300 text-xs md:text-sm">DITOLAK</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 text-red-400">
              {summary.rejected}
            </h2>
            <p className="text-xs text-red-400 mt-2 hidden sm:block">
              ✕ Kembali ke teknisi
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
          <div className="md:col-span-4 space-y-4">
            <h2 className="text-sm text-blue-300 tracking-widest mb-2">
              ANTRIAN VERIFIKASI
            </h2>

            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isDamaged = !!job.is_damaged;

              return (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    isDamaged
                      ? isSelected
                        ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20"
                        : "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
                      : isSelected
                      ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                      : "border-blue-500/20 hover:border-blue-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-xs ${isDamaged ? "text-red-300" : "text-blue-400"}`}>
                        {job.id}
                      </p>
                      <p className="font-semibold mt-1">{job.item_name}</p>
                    </div>

                    {isDamaged && (
                      <span className="px-2 py-1 text-[10px] rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 whitespace-nowrap">
                        RUSAK
                      </span>
                    )}
                  </div>

                  <p className={`text-xs mt-2 ${isDamaged ? "text-red-200/80" : "text-blue-200/70"}`}>
                    Teknisi: {job.technician_name}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-8">
            {!selectedJob ? (
              <div className="h-full min-h-[300px] flex items-center justify-center border border-blue-500/20 rounded-2xl text-blue-300/60">
                Pilih job untuk diverifikasi
              </div>
            ) : (
              <div
                className={`rounded-2xl overflow-hidden border shadow-xl ${
                  selectedJob.is_damaged
                    ? "bg-gradient-to-br from-[#1a0a0a] to-[#120404] border-red-500/30 shadow-red-500/10"
                    : "bg-gradient-to-br from-[#0b1325] to-[#020617] border-blue-500/30"
                }`}
              >
                <div
                  className={`p-6 ${
                    selectedJob.is_damaged
                      ? "bg-gradient-to-r from-red-600 to-red-800"
                      : "bg-gradient-to-r from-blue-600 to-blue-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs opacity-80">{selectedJob.id}</p>
                      <h2 className="text-2xl font-semibold mt-1">
                        {selectedJob.item_name}
                      </h2>
                      <p className="text-sm opacity-80 mt-1">
                        Teknisi: {selectedJob.technician_name}
                      </p>
                    </div>

                    {!!selectedJob.is_damaged && (
                      <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-sm font-semibold whitespace-nowrap">
                        BARANG RUSAK
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <p className={`text-sm mb-2 ${selectedJob.is_damaged ? "text-red-300" : "text-blue-300"}`}>
                    {selectedJob.is_damaged ? "KETERANGAN KERUSAKAN" : "LAPORAN TEKNISI"}
                  </p>

                  <div
                    className={`p-4 rounded-xl border ${
                      selectedJob.is_damaged
                        ? "bg-red-500/5 border-red-500/20 text-red-100"
                        : "bg-blue-500/5 border-blue-500/20"
                    }`}
                  >
                    {selectedJob.technician_action || "-"}
                  </div>

                  {!!selectedJob.is_damaged && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-red-300 text-sm font-medium">
                        Barang ini ditandai rusak oleh teknisi.
                      </p>
                      <p className="text-red-200/80 text-sm mt-1">
                        Jika disetujui, status job akan menjadi rusak dan proses maintenance berhenti di sini.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setRejectJob(selectedJob)}
                      className="px-6 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Tolak
                    </button>

                    <button
                      disabled={loading}
                      onClick={handleApprove}
                      className={`px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedJob.is_damaged
                          ? "bg-gradient-to-r from-red-600 to-red-700"
                          : "bg-gradient-to-r from-blue-600 to-blue-700"
                      }`}
                    >
                      {loading
                        ? "Memproses..."
                        : selectedJob.is_damaged
                        ? "Setujui Rusak"
                        : "Setujui & Lanjutkan →"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {rejectJob && (
          <RejectModal
            job={rejectJob}
            onClose={() => setRejectJob(null)}
            onSubmit={async (note) => {
              await verifyJob(rejectJob.id, "rejected", note);
              setRejectJob(null);
              setSelectedJob(null);
              fetchJobs();
            }}
          />
        )}
      </div>
    </Layout>
  );
}