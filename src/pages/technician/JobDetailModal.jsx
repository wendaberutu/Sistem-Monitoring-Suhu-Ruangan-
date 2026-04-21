import { useState } from "react";
import { submitJob } from "../../api/servicesJob.api";

export default function JobDetailModal({ job, onClose }) {
  const [action, setAction] = useState("");
  const [isDamaged, setIsDamaged] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action.trim()) {
      alert(isDamaged ? "Alasan barang rusak wajib diisi" : "Tindakan wajib diisi");
      return;
    }

    try {
      setLoading(true);
      await submitJob(job.id, action, isDamaged);
      alert("Berhasil dikirim ke verifikasi");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center">
      <div className="bg-[#0f172a] w-full max-w-3xl rounded-t-2xl sm:rounded-2xl p-4 md:p-8 border border-blue-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">Detail Tugas</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <p className="text-blue-300 text-sm">{job.id}</p>

        <h3 className="text-xl font-semibold mt-2">
          {job.item_name}
        </h3>

        <p className="text-blue-200/70 mt-2">
          {job.reported_issue}
        </p>

        {job.last_reject_note && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm font-semibold">
              Alasan Ditolak:
            </p>
            <p className="text-red-300/80 text-sm mt-1">
              {job.last_reject_note.replace("VERIFIKASI DITOLAK: ", "")}
            </p>
          </div>
        )}

        {job.status === "in_progress" && (
          <>
            <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDamaged}
                  onChange={(e) => setIsDamaged(e.target.checked)}
                  className="w-5 h-5 accent-red-500"
                />
                <span className="text-red-400 font-medium">Barang Rusak</span>
              </label>

              {isDamaged && (
                <p className="text-red-300/80 text-sm mt-2">
                  jika di centang maka akan diajukan sebagai barang rusak dan akan di setujui oleh verifikator sebagai barang rusak 
                </p>
              )}
            </div>

            <textarea 
              value={action}
              onChange={(e) => setAction(e.target.value)}
              rows={4}
              className="w-full mt-4 p-4 rounded-xl bg-[#111c2e] border border-blue-500/20 focus:outline-none focus:border-blue-500"
              placeholder={
                isDamaged
                  ? "Tuliskan alasan barang rusak..."
                  : "Tuliskan tindakan yang dilakukan..."
              }
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`mt-6 w-full py-3 rounded-xl font-semibold disabled:opacity-50 ${
                isDamaged
                  ? "bg-gradient-to-r from-red-600 to-red-700"
                  : "bg-gradient-to-r from-blue-600 to-blue-700"
              }`}
            >
              {loading ? "Mengirim..." : "Submit ke Verifikasi"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}