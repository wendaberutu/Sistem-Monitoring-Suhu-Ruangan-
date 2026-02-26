import { useEffect, useState } from "react";
import Layout from "../../layout/servicesLayout";
import { getAvailableJobs, claimJob } from "../../api/servicesJob.api";

export default function ClaimTaskPage() {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

const fetchJobs = async () => {
  try {
    const res = await getAvailableJobs();
    setAvailableTasks(res.data.data || []);
  } catch (err) {
    console.error(err);
  }
};

  const handleClaim = async (id) => {
    try {
      setLoadingId(id);
      await claimJob(id);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal claim");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Layout variant="technician">
      <div className="min-h-screen w-full text-white relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.12),transparent_40%)]" />

        <div className="relative z-10 max-w-6xl mx-auto py-10 space-y-12">

          {/* ================= SCAN SECTION ================= */}
          <div className="bg-[#111c2e]/80 backdrop-blur-md border border-blue-500/20 rounded-3xl p-12 text-center shadow-lg">

            <div className="w-20 h-20 mx-auto mb-6 rounded-full 
              bg-blue-500/20 border border-blue-500/30
              flex items-center justify-center text-3xl">
              ⬛
            </div>

            <h2 className="text-3xl font-semibold mb-4">
              Klaim Tugas Baru
            </h2>

            <p className="text-blue-200/80 mb-8">
              Scan barcode pada tiket atau perangkat untuk mengambil tugas ini.
            </p>

            <div className="flex justify-center gap-6 flex-wrap">

              <button className="px-10 py-4 rounded-xl font-semibold 
                bg-gradient-to-r from-blue-600 to-blue-700 
                hover:from-blue-700 hover:to-blue-800
                shadow-lg shadow-blue-500/20 transition">
                Mulai Scan QR
              </button>

              <button className="px-10 py-4 rounded-xl font-semibold 
                border border-blue-400/30
                hover:bg-blue-500/10 transition">
                Input Manual
              </button>

            </div>

            <p className="text-sm text-blue-300/60 mt-6">
              Gunakan input manual jika perangkat scanner tidak dapat digunakan.
            </p>

          </div>

          {/* ================= MANUAL CLAIM LIST ================= */}
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
                    rounded-2xl p-6 hover:border-blue-500/40 transition
                    shadow-md hover:shadow-blue-500/10"
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
                      border border-blue-400/20
                      transition shadow"
                  >
                    {loadingId === task.id ? "Mengambil..." : "Klaim"}
                  </button>

                </div>
              ))}

            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}