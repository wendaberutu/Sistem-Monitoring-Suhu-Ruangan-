import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Layout from "../../layout/servicesLayout";
import { startSanitation, finishSanitation, getJobInSanitation } from "../../api/servicesJob.api";  // Pastikan API client diimpor


export default function SanitasiPage() {
  const [items, setItems] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const html5QrCodeRef = useRef(null);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch { }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleSanitasiQR = useCallback(async (uid) => {
    try {
      const existing = items.find((i) => i.qr_code_uid === uid);

      if (!existing) {
        // Mulai sanitasi untuk pemindaian pertama
        await startSanitation(uid);
        setSuccessMessage("Sanitasi dimulai");

        // Memperbarui data setelah status berhasil diubah
        const res = await getJobInSanitation();  // Panggil API lagi untuk mendapatkan data terbaru
        setItems(res.data.data);  // Perbarui state dengan data terbaru

      } else {
        // Selesaikan sanitasi untuk pemindaian kedua
        await finishSanitation(uid);

        // Memperbarui data setelah status berhasil diubah
        const res = await getJobInSanitation();  // Panggil API lagi untuk mendapatkan data terbaru
        setItems(res.data.data);  // Perbarui state dengan data terbaru

        setSuccessMessage("Sanitasi selesai & dikirim ke QC");
      }

      // Hapus pesan sukses dan hentikan scanner setelah sedikit waktu
      setTimeout(() => {
        setSuccessMessage("");
        stopScanner();
      }, 1500);

    } catch (err) {
      alert(err.response?.data?.message || "Proses gagal");
      await stopScanner();
    }
  }, [items, stopScanner]);

  const startScanner = () => {
    setScanning(true);
  };

  useEffect(() => {
    const fetchSanitasiInProgress = async () => {
      try {
        const res = await getJobInSanitation();
        setItems(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil data sanitasi: ", err);
      }
    };

    fetchSanitasiInProgress();
  }, []);

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
            await handleSanitasiQR(decodedText.trim());
          }
        );
      } catch {
        setScanning(false);
      }
    };

    const timeout = setTimeout(startCamera, 200);
    return () => clearTimeout(timeout);
  }, [scanning, handleSanitasiQR]);

  return (
    <Layout variant="technician">
      <div className="h-screen w-full flex overflow-hidden">
        {/* Left Panel */}
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
                onClick={startScanner}
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

        {/* Right Panel */}
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
              <div key={item.qr_code_uid} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <div className="flex justify-between items-center space-x-6">
                  {/* Icon Section */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl shadow-md">
                    🧴
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{item.item_name}</h3>
                    <p className="text-gray-500 text-sm">{item.qr_code_uid}</p>
                  </div>

                  {/* Status Text Section (on the right side) */}
                  <div className="text-right">
                    <p className="text-blue-600 text-sm font-medium">Dalam Proses</p>
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