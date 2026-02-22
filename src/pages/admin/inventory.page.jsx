import { useState } from "react";
import Layout from "../../layout/servicesLayout";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("inventaris");
  const [alatList, setAlatList] = useState([]);
  const [namaAlat, setNamaAlat] = useState("");
  const [peminjam, setPeminjam] = useState("");
  const [selectedAlat, setSelectedAlat] = useState("");

  const handleTambahAlat = () => {
    if (!namaAlat.trim()) return;
    setAlatList([...alatList, { id: Date.now(), nama: namaAlat }]);
    setNamaAlat("");
  };

  const handlePinjam = () => {
    if (!selectedAlat || !peminjam) return;
    alert("Peminjaman berhasil");
  };

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200
      ${
        activeTab === id
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-400 hover:bg-gray-800"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Layout>
      <div className="max-w-[1200px] mx-auto">
        {/* MAIN CARD */}
        <div
          className="bg-gray-900/70 backdrop-blur-md border border-gray-800 
          rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] p-10"
        >
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition">
              <div className="text-sm text-gray-400">Total Alat</div>
              <div className="text-2xl font-bold text-white mt-2">
                {alatList.length}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-sm text-gray-400">Sedang Dipinjam</div>
              <div className="text-2xl font-bold text-yellow-400 mt-2">0</div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-sm text-gray-400">Tersedia</div>
              <div className="text-2xl font-bold text-green-400 mt-2">
                {alatList.length}
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-3 mb-10 bg-gray-800 p-2 rounded-xl">
            <TabButton id="inventaris" label="INVENTARIS" />
            <TabButton id="pinjam" label="PINJAM" />
            <TabButton id="riwayat" label="RIWAYAT" />
          </div>

          {/* ================= INVENTARIS ================= */}
          {activeTab === "inventaris" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Tambah Alat Baru
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Kelola daftar alat yang tersedia untuk dipinjam.
                </p>
              </div>

              <div className="flex gap-4 mb-10">
                <input
                  type="text"
                  placeholder="Nama alat (Contoh: Bor Listrik)"
                  value={namaAlat}
                  onChange={(e) => setNamaAlat(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white 
                    rounded-xl px-4 py-3 focus:outline-none focus:ring-2 
                    focus:ring-blue-500 transition"
                />
                <button
                  onClick={handleTambahAlat}
                  className="bg-blue-600 text-white px-6 rounded-xl 
                    font-semibold hover:bg-blue-700 shadow-lg transition"
                >
                  Tambah
                </button>
              </div>

              {alatList.length === 0 ? (
                <div
                  className="border border-dashed border-gray-700 
                  rounded-2xl py-20 text-center bg-gradient-to-br 
                  from-gray-800 to-gray-900"
                >
                  <div className="text-4xl mb-4 opacity-60">📦</div>

                  <h3 className="text-lg font-semibold text-gray-300">
                    Belum ada alat yang terdaftar
                  </h3>

                  <p className="text-gray-500 text-sm mt-2">
                    Tambahkan alat pertama untuk mulai mengelola inventaris.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {alatList.map((a) => (
                    <div
                      key={a.id}
                      className="bg-gray-800 border border-gray-700 
                        rounded-xl p-6 hover:border-blue-500 
                        transition shadow-md"
                    >
                      <div className="font-semibold text-white text-lg">
                        {a.nama}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= PINJAM ================= */}
          {activeTab === "pinjam" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Form Peminjaman
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Isi data untuk memproses peminjaman alat.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-300">
                    Pilih Alat
                  </label>
                  <select
                    value={selectedAlat}
                    onChange={(e) => setSelectedAlat(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 
                      text-white rounded-xl px-4 py-3 
                      focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Alat Tersedia --</option>
                    {alatList.map((a) => (
                      <option key={a.id} value={a.nama}>
                        {a.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-300">
                    Nama Peminjam (Karyawan)
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={peminjam}
                    onChange={(e) => setPeminjam(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 
                      text-white rounded-xl px-4 py-3 
                      focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handlePinjam}
                  className="w-full bg-blue-600 text-white py-4 
                    rounded-xl text-lg font-semibold 
                    hover:bg-blue-700 shadow-lg transition"
                >
                  Proses Peminjaman
                </button>
              </div>
            </div>
          )}

          {/* ================= RIWAYAT ================= */}
          {activeTab === "riwayat" && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Daftar Peminjaman Aktif
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Lihat peminjaman yang sedang berjalan.
                </p>
              </div>

              <div
                className="border border-dashed border-gray-700 
                rounded-2xl py-20 text-center bg-gradient-to-br 
                from-gray-800 to-gray-900"
              >
                <div className="text-4xl mb-4 opacity-60">📋</div>

                <h3 className="text-lg font-semibold text-gray-300">
                  Tidak ada peminjaman aktif
                </h3>

                <p className="text-gray-500 text-sm mt-2">
                  Semua alat saat ini tersedia.
                </p>
              </div>

              <h3 className="mt-12 text-lg font-semibold text-gray-300">
                Peminjaman Selesai
              </h3>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
