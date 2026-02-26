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

  /* ================= SUMMARY COUNT ================= */
  const summary = useMemo(() => {
    return {
      pending: jobs.length,
      approved: 0,
      rejected: 0,
    };
  }, [jobs]);

  return (
    <Layout variant="verifier">
      <div >

        <h1 className="text-3xl font-semibold mb-8">Verifikasi Pekerjaan</h1>

        {/* ================= SUMMARY ================= */}
        <div className="grid grid-cols-3 gap-6 mb-10">

          {/* MENUNGGU */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0b1325] to-[#020617]
            border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <p className="text-blue-300 text-sm">MENUNGGU</p>
            <h2 className="text-3xl font-bold mt-2">{summary.pending}</h2>
            <p className="text-xs text-yellow-400 mt-2">
              ● Perlu tindakan segera
            </p>
          </div>

          {/* DISETUJUI */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0b1325] to-[#020617]
            border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <p className="text-blue-300 text-sm">DISETUJUI</p>
            <h2 className="text-3xl font-bold mt-2 text-green-400">
              {summary.approved}
            </h2>
            <p className="text-xs text-green-400 mt-2">
              ✓ Sudah ke sanitasi
            </p>
          </div>

          {/* DITOLAK */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-[#0b1325] to-[#020617]
            border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <p className="text-blue-300 text-sm">DITOLAK</p>
            <h2 className="text-3xl font-bold mt-2 text-red-400">
              {summary.rejected}
            </h2>
            <p className="text-xs text-red-400 mt-2">
              ✕ Kembali ke teknisi
            </p>
          </div>

        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="grid grid-cols-12 gap-8">

          {/* ===== ANTRIAN (KIRI) ===== */}
          <div className="col-span-4 space-y-4">
            <h2 className="text-sm text-blue-300 tracking-widest mb-2">
              ANTRIAN VERIFIKASI
            </h2>

            {jobs.map(job => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`w-full text-left p-4 rounded-xl border transition
                ${selectedJob?.id === job.id
                    ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"
                    : "border-blue-500/20 hover:border-blue-500/40"
                  }`}
              >
                <p className="text-xs text-blue-400">{job.id}</p>
                <p className="font-semibold mt-1">{job.item_name}</p>
                <p className="text-xs text-blue-200/70 mt-1">
                  Teknisi: {job.technician_name}
                </p>
              </button>
            ))}
          </div>

          {/* ===== DETAIL (KANAN) ===== */}
          <div className="col-span-8">
            {!selectedJob ? (
              <div className="h-full flex items-center justify-center
                border border-blue-500/20 rounded-2xl text-blue-300/60">
                Pilih job untuk diverifikasi
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden
                bg-gradient-to-br from-[#0b1325] to-[#020617]
                border border-blue-500/30 shadow-xl">

                {/* HEADER */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800">
                  <p className="text-xs opacity-80">{selectedJob.id}</p>
                  <h2 className="text-2xl font-semibold mt-1">
                    {selectedJob.item_name}
                  </h2>
                  <p className="text-sm opacity-80 mt-1">
                    Teknisi: {selectedJob.technician_name}
                  </p>
                </div>

                {/* BODY */}
                <div className="p-6">
                  <p className="text-blue-300 text-sm mb-2">
                    LAPORAN TEKNISI
                  </p>

                  <div className="p-4 rounded-xl bg-blue-500/5
                    border border-blue-500/20">
                    {selectedJob.Technician_Action || "-"}
                  </div>

                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setRejectJob(selectedJob)}
                      className="px-6 py-2 rounded-xl
                      border border-red-500/40 text-red-400
                      hover:bg-red-500/10 transition"
                    >
                      Tolak
                    </button>

                    <button
                      disabled={loading}
                      onClick={handleApprove}
                      className="px-8 py-3 rounded-xl font-semibold
                                bg-gradient-to-r from-blue-600 to-blue-700
                                disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Memproses..." : "Setujui & Lanjutkan →"}
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