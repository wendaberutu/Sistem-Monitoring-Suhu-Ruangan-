import { useState, useRef } from "react";
import Layout from "../../layout/servicesLayout";
import { Html5Qrcode } from "html5-qrcode";
import { scanQcJob, verifyQcJob } from "../../api/servicesJob.api";

export default function QCScanPage() {

  const [scanning, setScanning] = useState(false);
  const [job, setJob] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [rejectNote, setRejectNote] = useState("");

  const html5QrCodeRef = useRef(null);

  const startScanner = async () => {
    setScanning(true);

    setTimeout(async () => {
      try {
        const qr = new Html5Qrcode("reader");
        html5QrCodeRef.current = qr;

        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            try {
              const res = await scanQcJob(decodedText);
              setJob(res.data.data);
              setSuccessMessage("QR berhasil dibaca");
            } catch {
              setSuccessMessage("QR tidak valid");
            }
          }
        );
      } catch (err) {
        console.error(err);
      }
    }, 300);
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      setScanning(false);
    }
  };

  const handleApprove = async () => {
    try {
      await verifyQcJob({
        qr_code_uid: job.qr_code_uid,
        status: "approved"
      });

      setSuccessMessage("QC disetujui");
      setJob(null);
      setRejectNote("");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const handleReject = async () => {
    if (!rejectNote) {
      alert("Catatan wajib diisi");
      return;
    }

    try {
      await verifyQcJob({
        qr_code_uid: job.qr_code_uid,
        status: "rejected",
        note: rejectNote
      });

      setSuccessMessage("QC ditolak");
      setJob(null);
      setRejectNote("");
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <Layout variant="technician">
      <div className="h-screen w-full flex overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-1/2 relative flex flex-col justify-center px-20 bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#1e40af] text-white overflow-hidden">

          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/30 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-8">

            <h1 className="text-5xl font-bold leading-tight">
              Scan QR QC
            </h1>

            {!scanning ? (
              <button
                onClick={startScanner}
                className="mt-6 px-10 py-5 rounded-2xl font-semibold text-lg bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/25 transition shadow-xl"
              >
                Aktifkan Scanner
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

                <button
                  onClick={stopScanner}
                  className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
                >
                  Stop Scanner
                </button>

              </div>
            )}

          </div>
        </div>


        {/* RIGHT PANEL */}
        <div className="w-1/2 bg-gray-100 p-16 flex flex-col text-gray-800">

          <h2 className="text-3xl font-semibold mb-8 text-gray-800">
            Detail Verifikasi QC
          </h2>

          {!job ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="text-6xl mb-6 opacity-40">📦</div>
              <div className="text-lg">Scan QR untuk melihat detail job</div>
            </div>
          ) : (

            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 text-gray-800">

              <div>
                <div className="text-sm text-gray-500">JOB ID</div>
                <div className="text-lg font-semibold">{job.id}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">QR UID</div>
                <div className="text-lg">{job.qr_code_uid}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Technician</div>
                <div className="text-lg">{job.technician_name || "-"}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-lg">{job.status}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500">Notes</div>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg text-gray-800"
                  placeholder="Catatan jika ditolak..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
                >
                  Terima
                </button>

                <button
                  onClick={handleReject}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
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