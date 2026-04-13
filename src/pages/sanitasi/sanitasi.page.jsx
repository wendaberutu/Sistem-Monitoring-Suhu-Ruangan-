import { useState, useEffect, useCallback } from "react";
import Layout from "../../layout/servicesLayout";
import { finishSanitation, getJobInSanitation } from "../../api/servicesJob.api";
import { useQRScanner } from "../../hooks/useQRScanner";

export default function SanitasiPage() {
  const [items, setItems] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSanitasiQR = useCallback(
    async (uid) => {
      try {
        const existing = items.find((i) => i.qr_code_uid === uid);

        if (existing) {
          await finishSanitation(uid);

          const res = await getJobInSanitation();
          setItems(res.data.data || []);

          setSuccessMessage("Sanitasi selesai & dikirim ke QC");
        } else {
          setSuccessMessage("QR tidak ditemukan dalam daftar sanitasi.");
        }

        setTimeout(() => setSuccessMessage(""), 2000);
      } catch (err) {
        alert(err.response?.data?.message || "Proses gagal");
      } finally {
        setScanning(false);
      }
    },
    [items]
  );

  const { isNative, startNativeScan, startWebScan, stopWebScan } =
    useQRScanner(handleSanitasiQR);

  // ── Web: mulai html5-qrcode setelah elemen DOM siap ──────────────────────
  useEffect(() => {
    if (!scanning || isNative) return;

    const timeout = setTimeout(() => {
      startWebScan("reader-sanitasi").catch(() => setScanning(false));
    }, 200);

    return () => clearTimeout(timeout);
  }, [scanning, isNative, startWebScan]);

  const handleStart = async () => {
    if (isNative) {
      await startNativeScan();
    } else {
      setScanning(true);
    }
  };

  const handleStop = async () => {
    await stopWebScan();
    setScanning(false);
  };

  useEffect(() => {
    const fetchSanitasiInProgress = async () => {
      try {
        const res = await getJobInSanitation();
        setItems(res.data.data || []);
      } catch (err) {
        console.error("Gagal mengambil data sanitasi: ", err);
      }
    };

    fetchSanitasiInProgress();
  }, []);

  return (
    <Layout variant="technician">
      <div className="w-full flex flex-col lg:flex-row min-h-full">
        <div className="w-full lg:w-1/2 relative flex flex-col justify-center px-4 sm:px-6 md:px-10 lg:px-20 py-8 sm:py-10 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#1e40af] text-white overflow-hidden rounded-2xl lg:rounded-none">
          <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-blue-400/30 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight">
                Mode Auto Sanitasi
              </h1>

              <p className="mt-3 sm:mt-6 text-blue-100 text-sm sm:text-base lg:text-lg">
                Scan untuk menyelesaikan sanitasi dan kirim ke QC.
              </p>
            </div>

            {!scanning ? (
              <button
                onClick={handleStart}
                className="w-full sm:w-auto mt-2 sm:mt-6 px-6 sm:px-10 py-3 sm:py-5 rounded-2xl font-semibold text-sm sm:text-base lg:text-lg bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/25 transition shadow-xl"
              >
                ⬜ Aktifkan Scanner
              </button>
            ) : (
              /* Hanya tampil di web (isNative=false) */
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl p-3 sm:p-4 w-full max-w-[320px] shadow-2xl">
                  <div id="reader-sanitasi" className="w-full overflow-hidden rounded-xl" />
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

            {/* Pesan hasil scan (native) */}
            {isNative && successMessage && (
              <div className="px-4 py-3 bg-green-500/20 border border-green-400 text-white rounded-lg text-sm sm:text-base">
                {successMessage}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] text-gray-800 px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-8 lg:py-14 flex flex-col min-h-[45vh] lg:min-h-0 rounded-2xl lg:rounded-none mt-4 lg:mt-0">
          <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6 lg:mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight">
              Dalam Proses Sanitasi
            </h2>
            <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
              {items.length} Aktif
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 lg:space-y-6 pr-1 sm:pr-2 pb-4">
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 opacity-40">
                  📦
                </div>
                <div className="text-sm sm:text-lg text-center">
                  Belum ada barang aktif
                </div>
              </div>
            )}

            {items.map((item) => (
              <div
                key={item.qr_code_uid}
                className="bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
              >
                <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl shadow-md shrink-0">
                    🧴
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 break-words leading-snug">
                      {item.item_name}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm break-all mt-1">
                      {item.qr_code_uid}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-blue-600 text-xs sm:text-sm font-medium whitespace-nowrap">
                      Dalam Proses
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
