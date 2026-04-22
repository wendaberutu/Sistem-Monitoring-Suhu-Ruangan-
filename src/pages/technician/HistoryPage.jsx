import { useEffect, useState } from "react";
import Layout from "../../layout/servicesLayout";
import { getJobHistory } from "../../api/servicesJob.api";
import { useAuth } from "../../context/AuthContext";

const STATUS_LABEL = {
  completed: { label: "Selesai", color: "bg-emerald-500/20 text-emerald-300" },
  damaged: { label: "Barang Rusak", color: "bg-red-500/20 text-red-300" },
  pending_verifikasi_qc: { label: "Pending QC", color: "bg-yellow-500/20 text-yellow-300" },
  approved_maintenance: { label: "Disetujui", color: "bg-blue-500/20 text-blue-300" },
  in_sanitation: { label: "Sanitasi", color: "bg-purple-500/20 text-purple-300" },
};

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const layoutVariant = user?.permissions?.verifier ? "verifier" : "technician";

  useEffect(() => {
    getJobHistory()
      .then((res) => setJobs(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      j.item_name?.toLowerCase().includes(q) ||
      j.id?.toLowerCase().includes(q) ||
      j.nama_penyetor?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout variant={layoutVariant}>
      <div className="text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.08),transparent_40%)]" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-5 md:mb-8">
            Riwayat Pekerjaan
          </h1>

          <input
            type="text"
            placeholder="Cari nama barang, ID, atau penyetor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-5 px-4 py-2 rounded-xl bg-[#0b1222] border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          {loading ? (
            <p className="text-blue-300/60">Memuat riwayat...</p>
          ) : filtered.length === 0 ? (
            <p className="text-blue-300/60">Belum ada riwayat pekerjaan.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((job) => {
                const s = STATUS_LABEL[job.status] || {
                  label: job.status,
                  color: "bg-slate-500/20 text-slate-300",
                };
                return (
                  <div
                    key={job.id}
                    className="rounded-2xl p-4 sm:p-5
                      bg-gradient-to-r from-[#111c2e] to-[#0b1325]
                      border border-blue-500/20 hover:border-blue-500/50 transition"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between gap-3 md:gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`inline-flex px-3 py-1 text-[11px] rounded-full ${s.color}`}>
                            {s.label}
                          </span>
                          {!!job.is_damaged && (
                            <span className="inline-flex px-3 py-1 text-[11px] rounded-full bg-red-600/30 text-red-300">
                              Barang Rusak
                            </span>
                          )}
                        </div>

                        <h2 className="text-base sm:text-lg font-semibold break-words leading-snug">
                          {job.item_name}
                        </h2>

                        <p className="text-sm text-blue-200/70 mt-1 break-words">
                          {job.nama_penyetor}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          <span>Masuk: {formatDate(job.created_at)}</span>
                          {job.completed_at && (
                            <span>Selesai: {formatDate(job.completed_at)}</span>
                          )}
                        </div>

                        <p className="text-blue-300/40 text-xs mt-1 break-all">{job.id}</p>
                      </div>

                      <div className="flex md:items-start md:justify-end">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-blue-400 hover:text-blue-300 font-semibold text-sm"
                        >
                          Lihat Detail →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedJob && (
        <HistoryDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </Layout>
  );
}

function HistoryDetailModal({ job, onClose }) {
  const s = STATUS_LABEL[job.status] || { label: job.status, color: "bg-slate-500/20 text-slate-300" };

  const technicianAction = job.technician_action
    ? job.technician_action.replace(/^LAPORAN TEKNISI:\s*/i, "")
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[#0d1729] border border-slate-700 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={`inline-flex px-3 py-1 text-xs rounded-full ${s.color} mb-2`}>
              {s.label}
            </span>
            <h2 className="text-white text-lg font-bold leading-snug">{job.item_name}</h2>
            <p className="text-slate-400 text-xs mt-0.5 break-all">{job.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl shrink-0">✕</button>
        </div>

        <div className="space-y-3 text-sm">
          <InfoRow label="Penyetor" value={job.nama_penyetor} />
          <InfoRow label="Penerima" value={job.received_by_name} />
          <InfoRow label="Teknisi" value={job.technician_name} />
          <InfoRow label="Deskripsi" value={job.item_description} />
          <InfoRow label="Keluhan" value={job.reported_issue} />
          <InfoRow label="Tanggal Masuk" value={formatDate(job.created_at)} />
          <InfoRow label="Tanggal Selesai" value={formatDate(job.completed_at)} />

          {technicianAction && (
            <div className="bg-[#0b1222] border border-blue-500/20 rounded-xl p-3">
              <p className="text-xs text-blue-300/60 mb-1 font-medium">Laporan Teknisi</p>
              <p className="text-slate-200 text-sm leading-relaxed">{technicianAction}</p>
            </div>
          )}

          {!!job.is_damaged && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <p className="text-red-400 text-sm font-semibold">⚠ Barang Dinyatakan Rusak</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3">
      <span className="text-slate-500 shrink-0 w-28">{label}</span>
      <span className="text-slate-200 break-words flex-1">{value || "-"}</span>
    </div>
  );
}
