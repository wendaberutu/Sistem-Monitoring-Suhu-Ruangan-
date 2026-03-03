import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Layout from "../../layout/servicesLayout";
import axios from "axios";  // Pastikan axios diimpor
import { startSanitation, finishSanitation } from "../../api/servicesJob.api";  // Pastikan API client diimpor

export default function SanitasiPage() {
  const [items, setItems] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const html5QrCodeRef = useRef(null);
  const lastScanRef = useRef(null);

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

  const handleScanSuccess = useCallback(
    async (uid) => {
      try {
        // Prevent scan spam dalam 1 detik
        if (lastScanRef.current === uid) return;
        lastScanRef.current = uid;
        setTimeout(() => (lastScanRef.current = null), 1000);

        const existing = items.find((i) => i.qr_code_uid === uid);

        // ===== SCAN PERTAMA → START =====
        if (!existing) {
          await startSanitation(uid);  // Panggil API start sanitasi

          const res = await axios.get(`/api/jobs/qr/${uid}`);
          const job = res.data.data;

          setItems((prev) => [...prev, job]);
          setSuccessMessage("Sanitasi dimulai");

        } else {
          // ===== SCAN KEDUA → FINISH =====
          await finishSanitation(uid);  // Panggil API finish sanitasi

          setItems((prev) => prev.filter((i) => i.qr_code_uid !== uid));
          setSuccessMessage("Sanitasi selesai & dikirim ke QC");
        }

        setTimeout(() => setSuccessMessage(""), 1500);
      } catch (err) {
        alert(err.response?.data?.message || "Proses gagal");
      }
    },
    [items]
  );

  useEffect(() => {
    if (!scanning) return;

    const startCamera = async () => {
      const element = document.getElementById("reader");
      if (!element) return;

      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            await handleScanSuccess(decodedText.trim());
          }
        );
      } catch {
        setScanning(false);
      }
    };

    const timeout = setTimeout(startCamera, 200);
    return () => clearTimeout(timeout);
  }, [scanning, handleScanSuccess]);

  return (
    <Layout variant="technician">
      <div className="h-screen w-full flex overflow-hidden">
        {/* ================= LEFT HERO ================= */}
        <div className="w-1/2 relative flex flex-col justify-center px-20 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#1e40af] text-white overflow-hidden">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/30 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-xl space-y-8">
            <div>
              <h1 className="text-5xl font-bold leading-tight">Mode Auto Sanitasi</h1>
              <p className="mt-6 text-blue-100 text-lg">
                Scan pertama memulai sanitasi. <br /> Scan kedua menyelesaikan dan kirim ke QC.
              </p>
            </div>

            {!scanning ? (
              <button
                onClick={() => setScanning(true)}
                className="mt-6 px-10 py-5 rounded-2xl font-semibold text-lg bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/25 transition shadow-xl"
              >
                ⬜ Aktifkan Scanner
              </button>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-4 w-[300px] shadow-2xl">
                  <div id="reader" />
                </div>

                {successMessage && (
                  <div className="px-4 py-3 bg-green-500/20 border border-green-400 text-white rounded-lg">
                    {successMessage}
                  </div>
                )}

                <button onClick={stopScanner} className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition">
                  Stop Scanner
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="w-1/2 bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] text-gray-800 px-16 py-14 flex flex-col h-full">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-semibold">Dalam Proses Sanitasi</h2>
            <div className="text-sm text-gray-500">{items.length} Aktif</div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-6xl mb-6 opacity-40">📦</div>
                <div className="text-lg">Belum ada barang aktif</div>
              </div>
            )}

            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-md">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">🧴</div>
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{item.code}</p>
                    <p className="text-blue-600 text-sm mt-1 font-medium">Dalam Proses</p>
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