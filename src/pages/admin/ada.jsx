import { useEffect, useState } from "react";
import Layout from "../../layout/servicesLayout";
import {
  getAllInventory,
  getInventoryTransactions,
  createInventoryItem,
  borrowInventoryItem,
  returnInventoryItem,
} from "../../api/inventory.api";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("inventaris");
  const [alatList, setAlatList] = useState([]);
  const [riwayat, setRiwayat] = useState([]);

  const [namaAlat, setNamaAlat] = useState("");
  const [stokAwal, setStokAwal] = useState("");
  const [peminjam, setPeminjam] = useState("");
  const [selectedAlat, setSelectedAlat] = useState("");

  const fetchInventory = async () => {
    const res = await getAllInventory();
    setAlatList(res.data);
  };

  const fetchTransactions = async () => {
    const res = await getInventoryTransactions();
    setRiwayat(res.data);
  };

  useEffect(() => {
    fetchInventory();
    fetchTransactions();
  }, []);

  const handleTambahAlat = async () => {
    if (!namaAlat.trim() || !stokAwal) return;

    await createInventoryItem({
      name: namaAlat,
      qty: Number(stokAwal),
    });

    setNamaAlat("");
    setStokAwal("");
    fetchInventory();
  };

  const handlePinjam = async () => {
    if (!selectedAlat || !peminjam) return;

    await borrowInventoryItem({
      inventoryId: selectedAlat,
      borrower: peminjam,
      qty: 1,
    });

    setSelectedAlat("");
    setPeminjam("");
    fetchInventory();
    fetchTransactions();
  };

  const handleKembalikan = async (trx) => {
    await returnInventoryItem({
      inventoryId: trx.inventory_id,
      borrower: trx.borrower_name,
      qty: trx.qty,
    });

    fetchInventory();
    fetchTransactions();
  };

  const totalStok = alatList.reduce(
    (sum, a) => sum + a.stock_total,
    0
  );

  const totalTersedia = alatList.reduce(
    (sum, a) => sum + a.stock_available,
    0
  );

  const sedangDipinjam = riwayat.filter(
    (r) => r.status === "borrowed"
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
        <div className="w-full bg-gray-900/70 border border-gray-800 rounded-2xl p-12">

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white">
              Peminjaman Alat Kerja
            </h1>
          </div>

          {/* SUMMARY */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 p-8 rounded-xl">
              <div className="text-sm text-gray-400">Total Stok</div>
              <div className="text-3xl font-bold text-white mt-3">
                {totalStok}
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl">
              <div className="text-sm text-gray-400">Sedang Dipinjam</div>
              <div className="text-3xl font-bold text-yellow-400 mt-3">
                {sedangDipinjam}
              </div>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl">
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

          {/* INVENTARIS */}
          {activeTab === "inventaris" && (
            <div>
              <div className="flex gap-4 mb-12">
                <input
                  type="text"
                  placeholder="Nama alat"
                  value={namaAlat}
                  onChange={(e) => setNamaAlat(e.target.value)}
                  className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-4"
                />
                <input
                  type="number"
                  placeholder="Jumlah stok"
                  value={stokAwal}
                  onChange={(e) => setStokAwal(e.target.value)}
                  className="w-40 bg-gray-800 text-white rounded-xl px-4 py-4"
                />
                <button
                  onClick={handleTambahAlat}
                  className="bg-blue-600 px-8 rounded-xl text-white"
                >
                  Tambah
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {alatList.map((a) => (
                  <div key={a.id} className="bg-gray-800 p-6 rounded-xl">
                    <div className="text-white font-semibold text-lg">
                      {a.name}
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      Total: {a.stock_total}
                    </div>
                    <div className="text-sm text-green-400">
                      Tersedia: {a.stock_available}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PINJAM */}
          {activeTab === "pinjam" && (
            <div className="max-w-2xl space-y-6">
              <select
                value={selectedAlat}
                onChange={(e) => setSelectedAlat(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-4"
              >
                <option value="">-- Pilih Alat --</option>
                {alatList
                  .filter((a) => a.stock_available > 0)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Sisa: {a.stock_available})
                    </option>
                  ))}
              </select>

              <input
                type="text"
                placeholder="Nama Peminjam"
                value={peminjam}
                onChange={(e) => setPeminjam(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-4"
              />

              <button
                onClick={handlePinjam}
                className="w-full bg-blue-600 py-4 rounded-xl text-white"
              >
                Proses Peminjaman
              </button>
            </div>
          )}

          {/* RIWAYAT */}
          {activeTab === "riwayat" && (
            <div className="space-y-4">
              {riwayat.map((r) => (
                <div
                  key={r.id}
                  className="bg-gray-800 p-6 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-semibold">
                      {r.item_name}
                    </div>
                    <div className="text-sm text-gray-400">
                      Peminjam: {r.borrower_name}
                    </div>
                    <div className="text-yellow-400">
                      {r.status}
                    </div>
                  </div>

                  {r.status === "borrowed" && (
                    <button
                      onClick={() => handleKembalikan(r)}
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