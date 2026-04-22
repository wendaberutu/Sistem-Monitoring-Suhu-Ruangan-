import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { trackJobByUID } from "../../api/track.api";
import { useQRScanner } from "../../hooks/useQRScanner";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: "waiting",               label: "Diterima",       icon: "📥", desc: "Barang telah diterima oleh security" },
  { key: "assigned",              label: "Ditugaskan",     icon: "👨‍🔧", desc: "Teknisi telah ditentukan" },
  { key: "in_progress",           label: "Dikerjakan",     icon: "🔧", desc: "Teknisi sedang mengerjakan barang" },
  { key: "pending_verification",  label: "Verifikasi",     icon: "🔍", desc: "Menunggu persetujuan verifikator" },
  { key: "pending_verifikasi_qc", label: "Verifikasi QC",  icon: "✅", desc: "Menunggu quality control" },
  { key: "approved_maintenance",  label: "Maintenance OK", icon: "👍", desc: "Proses maintenance selesai" },
  { key: "in_sanitation",         label: "Sanitasi",       icon: "🧹", desc: "Proses sanitasi / pembersihan" },
  { key: "completed",             label: "Selesai",        icon: "🎉", desc: "Barang siap diambil" },
];

const SPECIAL_STATUS = {
  rejected: {
    label: "Dikembalikan ke Teknisi",
    icon: "❌",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    desc: "Laporan ditolak verifikator, teknisi perlu mengerjakan ulang",
  },
  damaged: {
    label: "Barang Rusak",
    icon: "💔",
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    desc: "Barang dinyatakan rusak / tidak dapat diperbaiki",
  },
};

function getStepIndex(status) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (SPECIAL_STATUS[status]) {
    const s = SPECIAL_STATUS[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${s.bg} ${s.color}`}>
        {s.icon} {s.label}
      </span>
    );
  }
  const idx = getStepIndex(status);
  if (idx === STATUS_STEPS.length - 1)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
        🎉 Selesai
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
      ⏳ {STATUS_STEPS[idx]?.label ?? status}
    </span>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ status }) {
  const isSpecial  = !!SPECIAL_STATUS[status];
  const currentIdx = getStepIndex(status);

  return (
    <div>
      {isSpecial && (
        <div className={`mb-5 p-3 rounded-xl border text-sm ${SPECIAL_STATUS[status].bg} ${SPECIAL_STATUS[status].color}`}>
          <p className="font-semibold">{SPECIAL_STATUS[status].icon} {SPECIAL_STATUS[status].label}</p>
          <p className="mt-0.5 opacity-80 text-xs">{SPECIAL_STATUS[status].desc}</p>
        </div>
      )}

      {STATUS_STEPS.map((step, idx) => {
        const isDone    = !isSpecial && idx < currentIdx;
        const isCurrent = !isSpecial && idx === currentIdx;
        const isPending = isSpecial  || idx > currentIdx;
        const isLast    = idx === STATUS_STEPS.length - 1;

        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 z-10
                ${isDone    ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-300" : ""}
                ${isCurrent ? "bg-blue-500/25 border-2 border-blue-400 text-blue-200 ring-4 ring-blue-500/20" : ""}
                ${isPending ? "bg-slate-800/80 border-2 border-slate-600 text-slate-500" : ""}
              `}>
                {isDone ? "✓" : step.icon}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[28px] ${isDone ? "bg-emerald-500/40" : "bg-slate-700"}`} />
              )}
            </div>

            <div className={`pb-6 min-w-0 ${isLast ? "pb-0" : ""}`}>
              <p className={`text-sm font-semibold leading-tight mt-1.5
                ${isDone    ? "text-emerald-400" : ""}
                ${isCurrent ? "text-blue-200"    : ""}
                ${isPending ? "text-slate-500"   : ""}
              `}>
                {step.label}
                {isCurrent && (
                  <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-full align-middle">
                    Sekarang
                  </span>
                )}
              </p>
              {(isCurrent || isDone) && (
                <p className={`text-xs mt-0.5 leading-snug ${isDone ? "text-slate-500" : "text-slate-400"}`}>
                  {step.desc}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TrackPage() {
  const [searchParams]        = useSearchParams();
  const [uid, setUid]         = useState(searchParams.get("uid") || "");
  const [job, setJob]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  // ─── fetch ──────────────────────────────────────────────────────────────────
  const fetchJob = useCallback(async (value) => {
    const trimmed = (value ?? uid).trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setJob(null);
    try {
      const res  = await trackJobByUID(trimmed);
      const data = res.data?.data || res.data;
      if (!data?.id) throw new Error("not_found");
      setJob(data);
      setUid(trimmed);
    } catch (err) {
      if (err.response?.status === 404 || err.message === "not_found") {
        setError("QR tidak ditemukan. Pastikan kode sudah benar.");
      } else if (err.response?.status === 401) {
        setError("Akses ditolak. Hubungi petugas.");
      } else {
        setError("Gagal mengambil data. Coba lagi beberapa saat.");
      }
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    const p = searchParams.get("uid");
    if (p) fetchJob(p);
  }, []); // eslint-disable-line

  // ─── Scanner ─────────────────────────────────────────────────────────────────
  const handleScan = useCallback(async (scanned) => {
    setScannerOpen(false);
    const cleaned = scanned.includes("uid=")
      ? new URL(scanned).searchParams.get("uid") ?? scanned
      : scanned.trim();
    setUid(cleaned);
    await fetchJob(cleaned);
  }, [fetchJob]);

  const { isNative, startNativeScan, startWebScan, stopWebScan } = useQRScanner(handleScan);

  useEffect(() => {
    if (!scannerOpen) stopWebScan();
  }, [scannerOpen, stopWebScan]);

  const openScanner = async () => {
    if (isNative) {
      await startNativeScan();
    } else {
      setScannerOpen(true);
      setTimeout(() => startWebScan("qr-reader"), 200);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-dvh bg-[#080f1f] text-white">

      {/* ══ HEADER ══ */}
      <header className="shrink-0 bg-gradient-to-r from-[#0d1b3e] via-[#0e2154] to-[#0d1b3e] border-b border-white/5 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-xl">
              🔧
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight tracking-wide">Cek Status Servis</h1>
              <p className="text-blue-300/50 text-xs">Waleta Maintenance System</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sistem aktif
          </div>
        </div>
      </header>

      {/* ══ BODY — area ini yang scroll ══ */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-16">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 md:items-start">

          {/* ── KIRI: Panel input (sticky di desktop) ── */}
          <div className="w-full md:w-[360px] md:sticky md:top-8 shrink-0 space-y-4">

            {/* Search card */}
            <div className="bg-[#0d1b3e]/80 border border-blue-500/20 rounded-2xl p-5 shadow-2xl shadow-blue-950/30">
              <p className="text-xs text-blue-300/60 font-semibold tracking-widest mb-4">LACAK BARANG SERVIS</p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchJob()}
                  placeholder="Masukkan kode QR..."
                  className="flex-1 bg-[#060e20] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/50 min-w-0 transition"
                />
                <button
                  onClick={() => fetchJob()}
                  disabled={loading || !uid.trim()}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 shadow-lg shadow-blue-900/40"
                >
                  {loading
                    ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : "Cek"}
                </button>
              </div>

              <button
                onClick={openScanner}
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 hover:border-blue-500/40 text-slate-300 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              >
                <span className="text-lg">📷</span>
                Scan QR Code
              </button>

              {/* Error */}
              {error && (
                <div className="mt-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  {error}
                </div>
              )}
            </div>

            {/* Cara pakai — hanya tampil di desktop */}
            <div className="hidden md:block bg-white/3 border border-white/8 rounded-2xl p-5">
              <p className="text-xs text-slate-400 font-semibold tracking-widest mb-4">CARA MENGGUNAKAN</p>
              <div className="space-y-3">
                {[
                  { icon: "🧾", text: "Ambil struk penerimaan servis Anda" },
                  { icon: "📷", text: "Scan QR code pada struk, atau ketik kode UID-nya" },
                  { icon: "📊", text: "Lihat progress perbaikan barang secara real-time" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-sm shrink-0">
                      {item.icon}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── KANAN: Hasil ── */}
          <div className="flex-1 min-w-0">

            {/* Loading */}
            {loading && (
              <div className="bg-[#0d1b3e]/60 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-28 bg-blue-900/30" />
                <div className="p-6 space-y-4">
                  <div className="h-3 bg-slate-800 rounded-full w-2/3" />
                  <div className="h-3 bg-slate-800 rounded-full w-1/2" />
                  <div className="h-3 bg-slate-800 rounded-full w-3/4" />
                </div>
              </div>
            )}

            {/* Hasil job */}
            {!loading && job && (
              <div className="bg-[#0a1628]/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

                {/* Header card */}
                <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-blue-200/60 font-mono mb-1">{job.qr_code_uid}</p>
                      <h2 className="text-2xl font-bold text-white leading-tight">{job.item_name}</h2>
                    </div>
                    <div className="shrink-0 mt-1">
                      <StatusBadge status={job.status} />
                    </div>
                  </div>
                </div>

                {/* Detail + Timeline dalam grid di desktop */}
                <div className="md:grid md:grid-cols-2 md:divide-x md:divide-white/10">

                  {/* Detail info */}
                  <div className="px-6 py-5 space-y-4 border-b border-white/10 md:border-b-0">
                    <p className="text-[11px] text-slate-400 font-bold tracking-widest">DETAIL BARANG</p>

                    {job.reported_issue && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Keluhan / Issue</p>
                        <p className="text-slate-200 text-sm leading-relaxed">{job.reported_issue}</p>
                      </div>
                    )}

                    {job.item_description && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Kelengkapan</p>
                        <p className="text-slate-200 text-sm">{job.item_description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      {job.nama_penyetor && (
                        <div className="bg-white/4 rounded-xl p-3 border border-white/8">
                          <p className="text-slate-500 text-xs mb-1">Penyetor</p>
                          <p className="text-slate-200 text-sm font-semibold">{job.nama_penyetor}</p>
                        </div>
                      )}
                      {job.technician_name && (
                        <div className="bg-white/4 rounded-xl p-3 border border-white/8">
                          <p className="text-slate-500 text-xs mb-1">Teknisi</p>
                          <p className="text-slate-200 text-sm font-semibold">{job.technician_name}</p>
                        </div>
                      )}
                    </div>

                    {job.created_at && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Tanggal Masuk</p>
                        <p className="text-slate-300 text-sm">
                          {new Date(job.created_at).toLocaleString("id-ID", {
                            day: "2-digit", month: "long", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}

                    {job.completed_at && (
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Tanggal Selesai</p>
                        <p className="text-emerald-400 text-sm font-medium">
                          {new Date(job.completed_at).toLocaleString("id-ID", {
                            day: "2-digit", month: "long", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="px-6 py-5">
                    <p className="text-[11px] text-slate-400 font-bold tracking-widest mb-5">PROGRESS PERBAIKAN</p>
                    <Timeline status={job.status} />
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !job && !error && (
              <div className="h-full flex flex-col items-center justify-center py-20 md:py-32 text-center">
                <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-4xl mb-5 mx-auto">
                  📋
                </div>
                <p className="text-slate-300 font-semibold text-lg mb-2">Belum ada data</p>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                  Masukkan kode QR dari struk penerimaan servis untuk melihat progress barang Anda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* ══ WEB SCANNER MODAL ══ */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#0d1b3e] border border-blue-500/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="font-bold text-sm">Scan QR Code</p>
                <p className="text-slate-500 text-xs mt-0.5">Arahkan kamera ke QR pada struk</p>
              </div>
              <button
                onClick={() => setScannerOpen(false)}
                className="text-slate-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
              >
                ✕
              </button>
            </div>
            <div id="qr-reader" className="w-full bg-black" />
            <div className="px-4 py-3">
              <button
                onClick={() => setScannerOpen(false)}
                className="w-full bg-white/8 hover:bg-white/12 border border-white/10 text-white py-2.5 rounded-xl text-sm transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
