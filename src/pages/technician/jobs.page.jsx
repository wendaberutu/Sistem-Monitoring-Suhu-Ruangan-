import { useEffect, useState, useCallback, useRef } from "react";
import Layout from "../../layout/servicesLayout";
import JobDetailModal from "./JobDetailModal";
import { getMyJobs } from "../../api/servicesJob.api";
import { useQRScanner } from "../../hooks/useQRScanner";

export default function MyJobsPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const processingRef = useRef(false);

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

  const handleScanTechnician = useCallback(
    (scanned) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setScanning(false);

      const uid = scanned.includes("uid=")
        ? new URL(scanned).searchParams.get("uid") ?? scanned.trim()
        : scanned.trim();

      const found = jobs.find((j) => j.qr_code_uid === uid);
      if (found) {
        if (found.status === "in_progress") {
          setScanMessage("");
          setSelectedJob(found);
        } else {
          setScanMessage("Job tidak bisa disubmit (status: " + found.status.replaceAll("_", " ") + ")");
        }
      } else {
        setScanMessage("QR tidak ditemukan di daftar tugasmu");
      }

      processingRef.current = false;
    },
    [jobs]
  );

  const { isNative, startNativeScan, startWebScan, stopWebScan } =
    useQRScanner(handleScanTechnician);

  const prevScanningRef = useRef(false);
  useEffect(() => {
    if (prevScanningRef.current && !scanning) stopWebScan();
    prevScanningRef.current = scanning;
  }, [scanning, stopWebScan]);

  useEffect(() => {
    if (!scanning || isNative) return;
    const t = setTimeout(() => {
      startWebScan("reader-technician").catch(() => setScanning(false));
    }, 200);
    return () => clearTimeout(t);
  }, [scanning, isNative, startWebScan]);

  const handleStartScan = async () => {
    setScanMessage("");
    if (isNative) {
      await startNativeScan();
    } else {
      setScanning(true);
    }
  };

  const handleStopScan = async () => {
    await stopWebScan();
    setScanning(false);
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Sedang Berjalan") return job.status === "in_progress";
    if (activeTab === "Pending") return job.status === "pending_verification";
    return true;
  });

  return (
    <Layout variant="technician">
      <div className="w-full text-white relative px-3 py-4 sm:px-4 sm:py-6 md:px-10 md:py-10">
        <div
          className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.08),transparent_40%)]"
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-5 md:mb-8">
            Tugas Saya
          </h1>

          {/* ── Tombol Scan QR ── */}
          <div className="mb-6 md:mb-10">
            {!scanning ? (
              <button
                onClick={handleStartScan}
                className="relative group w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-base overflow-hidden
                  bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600
                  shadow-lg shadow-cyan-500/40
                  hover:shadow-cyan-500/60 hover:scale-[1.02]
                  active:scale-[0.98] transition-all duration-200"
              >
                {/* glow pulse background */}
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300 pointer-events-none" />

                {/* pulsing ring */}
                <span className="relative flex items-center justify-center w-8 h-8">
                  <span className="absolute w-8 h-8 rounded-full bg-white/20 animate-ping" />
                  <svg xmlns="http://www.w3.org/2000/svg" className="relative w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/>
                    <path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>
                  </svg>
                </span>

                <span className="relative text-white tracking-wide">Scan QR untuk Submit</span>
              </button>
            ) : (
              <div className="w-full sm:max-w-sm space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 shadow-xl shadow-cyan-500/20">
                  {/* scan line animation */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[scanline_2s_linear_infinite] z-10 pointer-events-none" />
                  <div className="bg-white p-3">
                    <div id="reader-technician" className="w-full overflow-hidden rounded-xl" />
                  </div>
                </div>
                <button
                  onClick={handleStopScan}
                  className="w-full py-2.5 rounded-xl bg-slate-700/80 border border-slate-600 text-slate-300 hover:bg-slate-700 transition text-sm font-medium"
                >
                  Tutup Scanner
                </button>
              </div>
            )}

            {scanMessage && (
              <p className={`mt-3 text-sm px-4 py-2.5 rounded-xl border w-full sm:w-auto inline-block ${
                scanMessage === ""
                  ? "hidden"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                {scanMessage}
              </p>
            )}
          </div>

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