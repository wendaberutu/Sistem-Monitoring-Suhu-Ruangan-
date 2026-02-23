import { useState } from "react";
import Layout from "../../layout/servicesLayout";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("inventaris");
  const [alatList, setAlatList] = useState([]);
  const [namaAlat, setNamaAlat] = useState("");
  const [stokAwal, setStokAwal] = useState("");
  const [peminjam, setPeminjam] = useState("");
  const [selectedAlat, setSelectedAlat] = useState("");
  const [riwayat, setRiwayat] = useState([]);

  const handleTambahAlat = () => {
    if (!namaAlat.trim() || !stokAwal) return;

    const existing = alatList.find(
      (a) => a.nama.toLowerCase() === namaAlat.toLowerCase()
    );

    if (existing) {
      setAlatList(
        alatList.map((a) =>
          a.id === existing.id
            ? {
                ...a,
                stokTotal: a.stokTotal + Number(stokAwal),
                stokTersedia: a.stokTersedia + Number(stokAwal),
              }
            : a
        )
      );
    } else {
      setAlatList([
        ...alatList,
        {
          id: Date.now(),
          nama: namaAlat,
          stokTotal: Number(stokAwal),
          stokTersedia: Number(stokAwal),
        },
      ]);
    }

    setNamaAlat("");
    setStokAwal("");
  };

  const handlePinjam = () => {
    if (!selectedAlat || !peminjam) return;

    const alat = alatList.find((a) => a.id === Number(selectedAlat));
    if (!alat || alat.stokTersedia <= 0) return;

    setAlatList(
      alatList.map((a) =>
        a.id === alat.id
          ? { ...a, stokTersedia: a.stokTersedia - 1 }
          : a
      )
    );

    setRiwayat([
      ...riwayat,
      {
        id: Date.now(),
        alatId: alat.id,
        namaAlat: alat.nama,
        peminjam,
        status: "dipinjam",
      },
    ]);

    setSelectedAlat("");
    setPeminjam("");
  };

  const handleKembalikan = (id) => {
    const data = riwayat.find((r) => r.id === id);
    if (!data || data.status === "dikembalikan") return;

    setAlatList(
      alatList.map((a) =>
        a.id === data.alatId
          ? { ...a, stokTersedia: a.stokTersedia + 1 }
          : a
      )
    );

    setRiwayat(
      riwayat.map((r) =>
        r.id === id ? { ...r, status: "dikembalikan" } : r
      )
    );
  };

  const totalStok = alatList.reduce((sum, a) => sum + (a.stokTotal || 0), 0);
  const totalTersedia = alatList.reduce(
    (sum, a) => sum + (a.stokTersedia || 0),
    0
  );
  const sedangDipinjam = riwayat.filter(
    (r) => r.status === "dipinjam"
  ).length;

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
      <div className="w-full min-h-screen px-8 py-10">
        <div className="w-full bg-gray-900/70 backdrop-blur-md border border-gray-800 rounded-2xl p-12">

          {/* TITLE */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white tracking-wide">
              Peminjaman Alat Kerja
            </h1>
            <p className="text-gray-400 mt-2">
              Sistem manajemen inventaris dan peminjaman alat kerja.
            </p>
          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="text-sm text-gray-400">Total Stok</div>
              <div className="text-3xl font-bold text-white mt-3">
                {totalStok}
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="text-sm text-gray-400">Sedang Dipinjam</div>
              <div className="text-3xl font-bold text-yellow-400 mt-3">
                {sedangDipinjam}
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="text-sm text-gray-400">Stok Tersedia</div>
              <div className="text-3xl font-bold text-green-400 mt-3">
                {totalTersedia}
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-3 mb-12 bg-gray-800 p-2 rounded-xl">
            <TabButton id="inventaris" label="INVENTARIS" />
            <TabButton id="pinjam" label="PINJAM" />
            <TabButton id="riwayat" label="RIWAYAT" />
          </div>

          {/* ================= INVENTARIS ================= */}
          {activeTab === "inventaris" && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">
                  Tambah Alat Baru
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Kelola daftar alat dan stoknya.
                </p>
              </div>

              <div className="flex gap-4 mb-12">
                <input
                  type="text"
                  placeholder="Nama alat"
                  value={namaAlat}
                  onChange={(e) => setNamaAlat(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-4"
                />
                <input
                  type="number"
                  placeholder="Jumlah stok"
                  value={stokAwal}
                  onChange={(e) => setStokAwal(e.target.value)}
                  className="w-40 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-4"
                />
                <button
                  onClick={handleTambahAlat}
                  className="bg-blue-600 text-white px-8 rounded-xl font-semibold"
                >
                  Tambah
                </button>
              </div>

              {alatList.length === 0 ? (
                <div className="border border-dashed border-gray-700 rounded-2xl py-24 text-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-5xl mb-4 opacity-60">📦</div>
                  <h3 className="text-lg font-semibold text-gray-300">
                    Belum ada alat yang terdaftar
                  </h3>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {alatList.map((a) => (
                    <div key={a.id} className="bg-gray-800 p-6 rounded-xl">
                      <div className="font-semibold text-white text-lg">
                        {a.nama}
                      </div>
                      <div className="text-sm text-gray-400 mt-2">
                        Total: {a.stokTotal}
                      </div>
                      <div className="text-sm text-green-400">
                        Tersedia: {a.stokTersedia}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= PINJAM ================= */}
          {activeTab === "pinjam" && (
            <div className="max-w-2xl space-y-6">
              <select
                value={selectedAlat}
                onChange={(e) => setSelectedAlat(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-4"
              >
                <option value="">-- Pilih Alat Tersedia --</option>
                {alatList
                  .filter((a) => a.stokTersedia > 0)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nama} (Sisa: {a.stokTersedia})
                    </option>
                  ))}
              </select>

              <input
                type="text"
                placeholder="Nama Peminjam (Karyawan)"
                value={peminjam}
                onChange={(e) => setPeminjam(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-4"
              />

              <button
                onClick={handlePinjam}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold"
              >
                Proses Peminjaman
              </button>
            </div>
          )}

          {/* ================= RIWAYAT ================= */}
          {activeTab === "riwayat" && (
            <div className="space-y-4">
              {riwayat.length === 0 && (
                <div className="text-gray-400">
                  Belum ada transaksi peminjaman.
                </div>
              )}

              {riwayat.map((r) => (
                <div
                  key={r.id}
                  className="bg-gray-800 p-6 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-semibold">
                      {r.namaAlat}
                    </div>
                    <div className="text-sm text-gray-400">
                      Peminjam: {r.peminjam}
                    </div>
                    <div
                      className={
                        r.status === "dipinjam"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }
                    >
                      {r.status}
                    </div>
                  </div>

                  {r.status === "dipinjam" && (
                    <button
                      onClick={() => handleKembalikan(r.id)}
                      className="bg-green-600 px-4 py-2 rounded-lg text-white"
                    >
                      Kembalikan
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}