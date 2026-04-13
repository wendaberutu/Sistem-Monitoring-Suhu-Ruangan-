import { useState, useEffect, useCallback } from "react";
import Layout from "../../layout/servicesLayout";
import { scanQcJob, verifyQcJob } from "../../api/servicesJob.api";
import { useQRScanner } from "../../hooks/useQRScanner";

export default function QCScanPage() {
  const [scanning, setScanning] = useState(false);
  const [job, setJob] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [rejectType, setRejectType] = useState("");

  const handleScan = useCallback(async (uid) => {
    try {
      const res = await scanQcJob(uid);
      setJob(res.data.data);
      setSuccessMessage("QR berhasil dibaca");
    } catch {
      setSuccessMessage("QR tidak valid");
    }
    // Setelah native scan selesai, kembalikan state
    setScanning(false);
  }, []);

  const { isNative, startNativeScan, startWebScan, stopWebScan } =
    useQRScanner(handleScan);

  // ── Web: mulai html5-qrcode setelah elemen DOM siap ──────────────────────
  useEffect(() => {
    if (!scanning || isNative) return;

    const timeout = setTimeout(() => {
      startWebScan("reader-qc").catch(() => setScanning(false));
    }, 200);

    return () => clearTimeout(timeout);
  }, [scanning, isNative, startWebScan]);

  const handleStart = async () => {
    if (isNative) {
      // Langsung buka native scanner, tidak perlu set scanning=true
      await startNativeScan();
    } else {
      setScanning(true);
    }
  };

  const handleStop = async () => {
    await stopWebScan();
    setScanning(false);
  };

  const handleApprove = async () => {
    try {
      await verifyQcJob({
        qr_code_uid: job.qr_code_uid,
        status: "approved",
      });

      setSuccessMessage("QC disetujui");
      setJob(null);
      setRejectNote("");
      setRejectType("");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal approve QC");
    }
  };

  const handleReject = async () => {
    if (!rejectNote) {
      alert("Catatan wajib diisi");
      return;
    }

    if (!rejectType) {
      alert("Pilih jenis penolakan");
      return;
    }

    try {
      await verifyQcJob({
        qr_code_uid: job.qr_code_uid,
        status: "rejected",
        reject_type: rejectType,
        note: rejectNote,
      });

      setSuccessMessage("QC ditolak");
      setJob(null);
      setRejectNote("");
      setRejectType("");
    } catch (err) {
      alert(err.response?.data?.message || "Gagal reject QC");
    }
  };

  return (
    <Layout variant="technician">
      <div className="w-full flex flex-col lg:flex-row min-h-full gap-4 lg:gap-0">
        <div className="w-full lg:w-1/2 relative flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-20 py-8 sm:py-10 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#1e40af] text-white overflow-hidden rounded-2xl lg:rounded-none">
          <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-blue-400/30 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
                Scan QR QC
              </h1>
              <p className="mt-3 sm:mt-5 text-blue-100 text-sm sm:text-base lg:text-lg">
                Scan QR untuk melihat detail job dan lakukan verifikasi QC.
              </p>
            </div>

            {/* Tombol scan (native: langsung buka kamera, web: tampilkan preview) */}
            {!scanning ? (
              <button
                onClick={handleStart}
                className="w-full sm:w-auto mt-2 sm:mt-6 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl font-semibold text-sm sm:text-base lg:text-lg bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/25 transition shadow-xl"
              >
                Aktifkan Scanner
              </button>
            ) : (
              /* Hanya tampil di web (isNative=false) */
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl p-3 sm:p-4 w-full max-w-[320px] shadow-2xl">
                  <div id="reader-qc" className="w-full overflow-hidden rounded-xl" />
                </div>

                {successMessage && (
                  <div className="px-4 py-3 bg-green-500/20 border border-green-400 text-white rounded-lg text-sm sm:text-base">
                    {successMessage}
                  </div>
                )}

                <button
                  onClick={handleStop}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition font-medium"
                >
                  Stop Scanner
                </button>
              </div>
            )}

            {/* Pesan hasil scan (native: ditampilkan di sini) */}
            {isNative && successMessage && (
              <div className="px-4 py-3 bg-green-500/20 border border-green-400 text-white rounded-lg text-sm sm:text-base">
                {successMessage}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-gray-100 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 lg:py-14 flex flex-col text-gray-800 rounded-2xl lg:rounded-none min-h-[45vh] lg:min-h-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-5 sm:mb-6 lg:mb-8 text-gray-800">
            Detail Verifikasi QC
          </h2>

          {!job ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 py-10">
              <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 opacity-40">
                📦
              </div>
              <div className="text-sm sm:text-lg text-center">
                Scan QR untuk melihat detail job
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 text-gray-800 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <div className="text-xs sm:text-sm text-gray-500">JOB ID</div>
                  <div className="text-sm sm:text-lg font-semibold break-all">
                    {job.id}
                  </div>
                </div>

                <div>
                  <div className="text-xs sm:text-sm text-gray-500">Status</div>
                  <div className="text-sm sm:text-lg capitalize break-words">
                    {job.status}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="text-xs sm:text-sm text-gray-500">QR UID</div>
                  <div className="text-sm sm:text-lg break-all">
                    {job.qr_code_uid}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <div className="text-xs sm:text-sm text-gray-500">Technician</div>
                  <div className="text-sm sm:text-lg break-words">
                    {job.technician_name || "-"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Jenis Penolakan
                </div>

                <select
                  value={rejectType}
                  onChange={(e) => setRejectType(e.target.value)}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-xl text-gray-800 bg-white text-sm sm:text-base"
                >
                  <option value="">Pilih alasan penolakan</option>
                  <option value="technician">Masalah Teknisi</option>
                  <option value="sanitation">Masalah Kebersihan / Sanitasi</option>
                </select>
              </div>

              <div>
                <div className="text-xs sm:text-sm text-gray-500">Notes</div>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-xl text-gray-800 text-sm sm:text-base min-h-[120px]"
                  placeholder="Catatan jika ditolak..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 sm:pt-4">
                <button
                  onClick={handleApprove}
                  className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Terima
                </button>

                <button
                  onClick={handleReject}
                  className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                >
                  Tolak
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
