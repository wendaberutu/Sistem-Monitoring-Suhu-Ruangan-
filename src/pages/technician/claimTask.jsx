import { useEffect, useState, useRef, useCallback } from "react";
import Layout from "../../layout/servicesLayout";
import { getAvailableJobs, claimJob, claimJobByQR } from "../../api/servicesJob.api";
import { Html5Qrcode } from "html5-qrcode";

export default function ClaimTaskPage() {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await getAvailableJobs();
      setAvailableTasks(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleClaim = async (id) => {
    try {
      setLoadingId(id);
      await claimJob(id);
      await fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal claim");
    } finally {
      setLoadingId(null);
    }
  };

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleClaimQR = useCallback(async (uid) => {
    try {
      setLoadingId(uid);

      await claimJobByQR(uid);

      setSuccessMessage("Job berhasil di-claim ✅");

      await fetchJobs();

      setTimeout(async () => {
        setSuccessMessage("");
        await stopScanner();
      }, 1500);

    } catch (err) {
      alert(err.response?.data?.message || "QR tidak valid");
      await stopScanner();
    } finally {
      setLoadingId(null);
    }
  }, [fetchJobs, stopScanner]);

  const startScanner = () => {
    setScanning(true);
  };

  useEffect(() => {
    if (!scanning) return;

    const startCamera = async () => {
      const element = document.getElementById("reader");
      if (!element) return;

      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      let scanned = false;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            if (scanned) return;
            scanned = true;

            const uid = decodedText.trim();
            await handleClaimQR(uid);
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
        setScanning(false);
      }
    };

    const timeout = setTimeout(startCamera, 200);

    return () => {
      clearTimeout(timeout);
    };

  }, [scanning, handleClaimQR]);

  return (
    <Layout variant="technician">
      <div className="min-h-screen w-full text-white relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.12),transparent_40%)]" />

        <div className="relative z-10 max-w-6xl mx-auto py-10 space-y-12">

          <div className="bg-[#111c2e]/80 backdrop-blur-md border border-blue-500/20 rounded-3xl p-12 text-center shadow-lg">
            <div className="flex flex-col items-center space-y-6">

              {!scanning ? (
                <>
                  <div className="w-20 h-20 rounded-full 
                    bg-blue-500/20 border border-blue-500/30
                    flex items-center justify-center text-3xl">
                    📷
                  </div>

                  <h2 className="text-3xl font-semibold">
                    Klaim Tugas Baru
                  </h2>

                  <p className="text-blue-200/80">
                    Scan QR untuk klaim berdasarkan UID.
                  </p>

                  <button
                    onClick={startScanner}
                    className="px-10 py-4 rounded-xl font-semibold 
                    bg-gradient-to-r from-blue-600 to-blue-700 
                    hover:from-blue-700 hover:to-blue-800
                    shadow-lg shadow-blue-500/20 transition"
                  >
                    Mulai Scan QR
                  </button>
                </>
              ) : (
                <>
                  <div id="reader" className="w-[300px] min-h-[250px]" />

                  {successMessage && (
                    <div className="mt-4 px-4 py-3 bg-green-600/20 border border-green-500/40 text-green-400 rounded-lg">
                      {successMessage}
                    </div>
                  )}

                  <button
                    onClick={stopScanner}
                    className="px-6 py-2 rounded-lg bg-red-600"
                  >
                    Stop Scan
                  </button>
                </>
              )}

            </div>
          </div>

          <div className="bg-[#111c2e]/80 backdrop-blur-md border border-blue-500/20 rounded-3xl p-10 shadow-lg">

            <h3 className="text-2xl font-semibold mb-8">
              Klaim Tugas Tersedia
            </h3>

            <div className="space-y-6">

              {availableTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-6
                    bg-[#0b1120] border border-blue-500/20
                    rounded-2xl p-6 hover:border-blue-500/40 transition"
                >
                  <div>
                    <p className="text-sm text-blue-400 font-semibold mb-1">
                      {task.id}
                    </p>

                    <h4 className="text-lg font-semibold text-white">
                      {task.item_name}
                    </h4>

                    <p className="text-sm text-blue-200/70 mt-1">
                      {task.reported_issue}
                    </p>
                  </div>

                  <button
                    onClick={() => handleClaim(task.id)}
                    disabled={loadingId === task.id}
                    className="px-6 py-3 rounded-xl font-semibold
                      bg-[#1e293b] hover:bg-blue-600
                      border border-blue-400/20 transition"
                  >
                    {loadingId === task.id ? "Mengambil..." : "Klaim"}
                  </button>

                </div>
              ))}

            </div>
          </div>                                                                                                                                  b
        </div>
      </div>
    </Layout>
  );
}