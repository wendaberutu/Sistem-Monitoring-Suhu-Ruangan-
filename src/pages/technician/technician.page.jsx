import Layout from "../../layout/servicesLayout";

export default function TechnicianDashboard() {
  return (
    <Layout variant="technician">
      <div >

        <div className="relative z-10 p-8">

          {/* TITLE */}
          <h1 className="text-2xl font-semibold mb-8 tracking-wide text-blue-200">
            Dashboard Teknisi
          </h1>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            <div className="rounded-2xl p-6 bg-[#111c2e] border border-blue-500/20 shadow-lg hover:shadow-blue-500/20 transition">
              <p className="text-sm text-blue-300">Total Tugas</p>
              <h2 className="text-4xl font-bold mt-3">5</h2>
            </div>

            <div className="rounded-2xl p-6 bg-[#111c2e] border border-yellow-500/20 shadow-lg hover:shadow-yellow-500/20 transition">
              <p className="text-sm text-yellow-300">In Progress</p>
              <h2 className="text-4xl font-bold mt-3">1</h2>
            </div>

            <div className="rounded-2xl p-6 bg-[#111c2e] border border-red-500/30 shadow-lg hover:shadow-red-500/20 transition">
              <p className="text-sm text-red-300">Ditolak (Reject)</p>
              <h2 className="text-4xl font-bold mt-3 text-red-400">1</h2>
            </div>

          </div>

          {/* ATTENTION SECTION */}
          <div className="rounded-2xl p-6 bg-[#111c2e] border border-blue-500/20 shadow-xl">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 font-bold">
                !
              </div>
              <h3 className="text-lg font-semibold text-blue-200">
                Perlu Atensi Segera
              </h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 
                            bg-red-600/10 border border-red-500/30 
                            rounded-xl p-6">

              <div>
                <h4 className="text-lg font-semibold text-red-300">
                  Cek Jaringan Kabel (JOB-095)
                </h4>
                <p className="text-sm text-red-200 mt-2">
                  Alasan Penolakan: Diagnosis kurang lengkap, foto bukti tidak jelas.
                </p>
              </div>

              <button className="px-6 py-3 rounded-lg font-semibold 
                                 bg-red-600 hover:bg-red-700 
                                 transition shadow-lg">
                Perbaiki Sekarang
              </button>

            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
}