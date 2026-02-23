import { useEffect, useState, useRef } from "react";
import Layout from "../../layout/servicesLayout";
import * as QRCode from "qrcode";

import {
  getAllInventory,
  getInventoryTransactions,
  createInventoryItem,
  borrowInventoryItem,
  returnInventoryItem,
  returnInventoryQr,
  updateInventoryItem,
  deleteInventoryItem,
} from "../../api/inventory.api";


export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("inventaris");
  const [alatList, setAlatList] = useState([]);
  const [riwayat, setRiwayat] = useState([]);

  const [namaAlat, setNamaAlat] = useState("");
  const [stokAwal, setStokAwal] = useState("");
  const [peminjam, setPeminjam] = useState("");
  const [selectedAlat, setSelectedAlat] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editTotal, setEditTotal] = useState(0);
  const [scanCode, setScanCode] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
  if (inputRef.current) {
    inputRef.current.focus();
  }
}, []);

const handleScanSubmit = async (e) => {
  if (e.key !== "Enter") return;

  if (!scanCode.trim()) return;

  try {
    await returnInventoryQr({
      transactionCode: scanCode.trim(),
    });

    setScanCode("");

    fetchInventory();
    fetchTransactions();

    alert("Barang berhasil dikembalikan");

  } catch (err) {
    alert(err.response?.data?.message || "Kode tidak valid");
    setScanCode("");
  }

  inputRef.current.focus();
};

  const fetchInventory = async () => {
    const res = await getAllInventory();
    setAlatList(res.data || []);
  };

  const fetchTransactions = async () => {
    const res = await getInventoryTransactions();
    setRiwayat(res.data || []);
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

    try {
      const res = await borrowInventoryItem({
        inventoryId: Number(selectedAlat),   // 🔥 WAJIB Number
        borrower: peminjam,
        qty: 1,
      });

      const code = res.data.transactionCode;

      if (!code) {
        alert("Transaction code tidak ada");
        return;
      }

      const qrImage = await QRCode.toDataURL(code);

      openPrintWindow(qrImage, code);

      fetchInventory();
      fetchTransactions();

    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Error 400");
    }
  };

  const handleKembalikan = async (trx) => {
    await returnInventoryItem({
      inventoryId: trx.inventory_id,
      borrower: trx.borrower_name,
    });

    fetchInventory();
    fetchTransactions();
  };

  const totalStok = alatList.reduce(
    (sum, a) => sum + (a.stock_total || 0),
    0
  );

  const totalTersedia = alatList.reduce(
    (sum, a) => sum + (a.stock_available || 0),
    0
  );

  const sedangDipinjam = riwayat.filter(
    (r) => r.status === "borrowed"
  ).length;

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === id
        ? "bg-blue-600 text-white shadow-lg"
        : "text-gray-400 hover:bg-gray-800"
        }`}
    >
      {label}
    </button>
  );


  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus alat ini?")) return;

    await deleteInventoryItem(id);
    fetchInventory();
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setEditName(item.name);
    setEditTotal(item.stock_total);
  };

  const closeEditModal = () => {
    setEditItem(null);
    setEditName("");
    setEditTotal(0);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;

    await updateInventoryItem(editItem.id, {
      name: editName,
      stock_total: Number(editTotal),
    });

    closeEditModal();
    fetchInventory();
  };


  const openPrintWindow = (qrImage, code) => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
    <html>
      <head>
        <title>QR</title>
        <style>
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            text-align: center;
          }
          .container {
            margin-top: 10px;
          }
          h3 {
            margin: 0;
            font-size: 16px;
          }
          p {
            margin: 6px 0 10px;
            font-size: 13px;
          }
          img {
            width: 170px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h3>QR Pengembalian</h3>
          <p>${code}</p>
          <img src="${qrImage}" />
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();

  };
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
            <SummaryCard title="Total Stok" value={totalStok} />
            <SummaryCard title="Sedang Dipinjam" value={sedangDipinjam} color="text-yellow-400" />
            <SummaryCard title="Stok Tersedia" value={totalTersedia} color="text-green-400" />
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
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">
                  Tambah Alat Baru
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Kelola daftar alat dan stoknya.
                </p>
              </div>                            <div className="flex gap-4 mb-8">
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

              {alatList.length === 0 ? (
                <div className="text-center text-gray-400 py-16">
                  Alat belum tersedia
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                  <table className="w-full text-white text-sm">
                    <thead className="bg-gray-800 text-gray-300">
                      <tr>
                        <th className="px-6 py-4 text-left">Nama</th>
                        <th className="px-6 py-4 text-center">Total</th>
                        <th className="px-6 py-4 text-center">Tersedia</th>
                        <th className="px-6 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alatList.map((a) => (
                        <tr
                          key={a.id}
                          className="border-t border-gray-800 hover:bg-gray-800/50 transition"
                        >
                          <td className="px-6 py-4 font-medium">
                            {a.name}
                          </td>

                          <td className="px-6 py-4 text-center">
                            {a.stock_total}
                          </td>

                          <td className="px-6 py-4 text-center font-semibold text-green-400">
                            {a.stock_available}
                          </td>

                          <td className="px-6 py-4 text-center space-x-2">
                            <button
                              onClick={() => openEditModal(a)}
                              className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-black rounded-md transition"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(a.id)}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-md transition"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                  {/* KIRI */}
                  <div>
                    <div className="text-white font-semibold text-lg">
                      {r.item_name}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Peminjam: {r.borrower_name}
                    </div>
                  </div>

                  {/* KANAN */}
                  <div className="text-right space-y-1">
                    {r.borrow_date && (
                      <div className="text-xs text-gray-400">
                        Pinjam: {new Date(r.borrow_date).toLocaleString("id-ID")}
                      </div>
                    )}

                    {r.return_date && (
                      <div className="text-xs text-gray-400">
                        Kembali: {new Date(r.return_date).toLocaleString("id-ID")}
                      </div>
                    )}

                    <StatusLabel status={r.status} />

                    {r.status === "borrowed" && (
                      <button
                        onClick={() => handleKembalikan(r)}
                        className="mt-2 bg-green-600 px-4 py-2 rounded-lg text-white text-sm"
                      >
                        Kembalikan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* modal Edit */}

          {editItem && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-8 shadow-2xl">

                <h2 className="text-2xl font-bold text-white mb-6">Edit Alat</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Nama Alat</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded-xl px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Total Stok</label>
                    <input
                      type="number"
                      value={editTotal}
                      onChange={(e) => setEditTotal(Number(e.target.value))}
                      className="w-full bg-gray-800 text-white rounded-xl px-4 py-3"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  >
                    Batal
                  </button>

                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <input
  ref={inputRef}
  value={scanCode}
  onChange={(e) => setScanCode(e.target.value)}
  onKeyDown={handleScanSubmit}
  style={{ position: "absolute", opacity: 0 }}
/>
    </Layout>

    
  );
}

/* ===== COMPONENTS ===== */

function SummaryCard({ title, value, color = "text-white" }) {
  return (
    <div className="bg-gray-800 p-8 rounded-xl">
      <div className="text-sm text-gray-400">{title}</div>
      <div className={`text-3xl font-bold mt-3 ${color}`}>{value}</div>
    </div>
  );
}

function StatusLabel({ status }) {
  const map = {
    borrowed: "text-yellow-400",
    returned: "text-green-400",
    damaged: "text-red-400",
    lost: "text-red-600",
  };

  const label = status === "borrowed" ? "Dipinjam" : status === "returned" ? "Dikembalikan" : status;

  return <div className={map[status] || "text-gray-400"}>{label}</div>;
}