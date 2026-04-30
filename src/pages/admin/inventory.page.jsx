import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as QRCode from "qrcode";
import Layout from "../../layout/servicesLayout";
import { useQRScanner } from "../../hooks/useQRScanner";
import {
  getDashboard,
  createBorrow,
  checkReturn,
  processReturn,
  getKaryawanById,
} from "../../api/peminjamanAset.api";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("pinjam");
  const [loading, setLoading] = useState(true);

  const [inventory, setInventory] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalStock: 0,
    totalAvailable: 0,
    totalBorrowed: 0,
  });

  const [borrowDate, setBorrowDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [borrowerId, setBorrowerId] = useState("");
  const [borrowerName, setBorrowerName] = useState("");

  const [itemCodeInput, setItemCodeInput] = useState("");
  const [itemNameInput, setItemNameInput] = useState("");
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);

  const [borrowList, setBorrowList] = useState([]);
  const [saving, setSaving] = useState(false);

  const [scanCode, setScanCode] = useState("");
  const [scannedTransaction, setScannedTransaction] = useState(null);
  const [scanMode, setScanMode] = useState(null);
  const [scanning, setScanning] = useState(false);

  const [toast, setToast] = useState(null);

  const scanRef = useRef(null);
  const toastTimer = useRef(null);
  const scanLockRef = useRef(false);
  const scanModeRef = useRef(null);
  const stopWebScanRef = useRef(null);

  const showToast = useCallback((text, type = "error") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, type });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const closeToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const borrowedItems = useMemo(
    () => history.filter((item) => item.status === "borrowed"),
    [history]
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getDashboard();
      const dashboard = res?.data?.data || {};

      const inventoryData = Array.isArray(dashboard.inventory)
        ? dashboard.inventory
        : [];

      const historyData = Array.isArray(dashboard.history)
        ? dashboard.history
        : [];

      console.log("DASHBOARD:", dashboard);
      console.log("INVENTORY:", inventoryData);

      setInventory(inventoryData);
      setHistory(historyData);
      setStats({
        totalStock: Number(dashboard.totalStock || 0),
        totalAvailable: Number(dashboard.totalAvailable || 0),
        totalBorrowed: Number(dashboard.totalBorrowed || 0),
      });
    } catch (err) {
      console.error("Gagal memuat data:", err);
      showToast(err?.response?.data?.message || "Gagal memuat data inventory");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const findInventoryByCode = useCallback(
    (code) => {
      const raw = String(code || "").trim();

      if (!raw) return null;

      const keyword = raw.toLowerCase();
      const paddedKeyword = raw.padStart(4, "0").toLowerCase();

      return inventory.find((item) => {
        const itemCode = String(item.code || "").trim().toLowerCase();
        const itemName = String(item.name || "").trim().toLowerCase();

        return (
          itemCode === keyword ||
          itemCode === paddedKeyword ||
          itemName.includes(keyword)
        );
      });
    },
    [inventory]
  );

  const normalizeScanText = useCallback((value) => {
    if (typeof value === "string") return value.trim();

    if (value?.text) return String(value.text).trim();
    if (value?.content) return String(value.content).trim();
    if (value?.result) return String(value.result).trim();
    if (value?.data) return String(value.data).trim();

    return String(value || "").trim();
  }, []);

  const parseBorrowerQr = useCallback(
    (rawText) => {
      const text = normalizeScanText(rawText);

      if (!text) {
        return { id: "", name: "" };
      }

      try {
        const parsed = JSON.parse(text);

        return {
          id: String(
            parsed.id_pegawai ||
              parsed.idPegawai ||
              parsed.id ||
              parsed.borrowerId ||
              parsed.nik ||
              parsed.uid ||
              ""
          ).trim(),
          name: String(
            parsed.nama_pegawai ||
              parsed.namaPegawai ||
              parsed.name ||
              parsed.borrowerName ||
              parsed.nama ||
              ""
          ).trim(),
        };
      } catch (_) {}

      if (/ - /.test(text)) {
        const idx = text.indexOf(" - ");
        return {
          id: text.slice(0, idx).trim(),
          name: text.slice(idx + 3).trim(),
        };
      }

      if (text.includes("|")) {
        const [id, name] = text.split("|");
        return { id: (id || "").trim(), name: (name || "").trim() };
      }

      if (text.includes(";")) {
        const [id, name] = text.split(";");
        return { id: (id || "").trim(), name: (name || "").trim() };
      }

      const idMatch = text.match(/\b\d{6,20}\b/);

      if (idMatch) {
        return {
          id: idMatch[0],
          name: "",
        };
      }

      return {
        id: text,
        name: "",
      };
    },
    [normalizeScanText]
  );

  const fetchBorrowerById = useCallback(
    async (id) => {
      const cleanId = String(id || "").trim();

      if (!cleanId) {
        setBorrowerName("");
        return null;
      }

      try {
        const res = await getKaryawanById(cleanId);
        const karyawan = res?.data?.data;

        if (!karyawan) {
          setBorrowerName("");
          showToast(`ID pegawai ${cleanId} tidak ditemukan di data karyawan`);
          return null;
        }

        setBorrowerId(karyawan.id_pegawai);
        setBorrowerName(karyawan.nama_pegawai);

        return karyawan;
      } catch (err) {
        setBorrowerName("");
        showToast(
          err?.response?.data?.message ||
            `ID pegawai ${cleanId} tidak ditemukan di data karyawan`
        );
        return null;
      }
    },
    [showToast]
  );

  const processReturnTransaction = async (trx) => {
    if (!trx || trx.status !== "borrowed") return;

    try {
      await processReturn({
        scanCode: trx.transactionCode,
      });

      setScannedTransaction(null);
      setScanCode("");
      scanRef.current?.focus();
      showToast("Barang berhasil dikembalikan", "success");
      await loadData();
    } catch (err) {
      showToast(err?.response?.data?.message || "Gagal memproses pengembalian");
    }
  };

  const handleUnifiedScan = useCallback(
    async (decodedText) => {
      if (scanLockRef.current) return;

      scanLockRef.current = true;

      const currentMode = scanModeRef.current || scanMode;
      const text = normalizeScanText(decodedText);

      console.log("HASIL SCAN:", text);
      console.log("SCAN MODE:", currentMode);

      await stopWebScanRef.current?.().catch(() => {});

      setScanning(false);
      setScanMode(null);
      scanModeRef.current = null;

      if (currentMode === "borrower") {
        const result = parseBorrowerQr(text);
        const cleanId = String(result.id || text || "").trim();

        console.log("ID HASIL PARSE:", cleanId);

        if (!cleanId) {
          showToast("QR ID peminjam tidak valid");
          scanLockRef.current = false;
          return;
        }

        setBorrowerId(cleanId);

        if (result.name) {
          setBorrowerName(result.name);
        }

        const karyawan = await fetchBorrowerById(cleanId);

        console.log("DATA KARYAWAN:", karyawan);

        if (karyawan) {
          showToast("ID peminjam berhasil di-scan", "success");
        }

        return;
      }

      if (currentMode === "return") {
        const code = text;
        setScanCode(code);

        try {
          const res = await checkReturn(code);
          setScannedTransaction(res.data.data);
          showToast("Kode pengembalian berhasil di-scan", "success");
        } catch (err) {
          setScannedTransaction(null);
          showToast(
            err?.response?.data?.message ||
              "Kode tidak valid atau barang sudah dikembalikan"
          );
        }

        return;
      }

      scanLockRef.current = false;
    },
    [
      scanMode,
      normalizeScanText,
      parseBorrowerQr,
      fetchBorrowerById,
      showToast,
    ]
  );

  const { isNative, startNativeScan, startWebScan, stopWebScan } =
    useQRScanner(handleUnifiedScan);

  useEffect(() => {
    stopWebScanRef.current = stopWebScan;
  }, [stopWebScan]);

  useEffect(() => {
    if (!scanning || isNative || !scanMode) return;

    const readerId =
      scanMode === "borrower" ? "reader-borrower-inline" : "reader-return-inline";

    const timeout = setTimeout(() => {
      startWebScan(readerId).catch(() => {
        setScanning(false);
        setScanMode(null);
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [scanning, isNative, scanMode, startWebScan]);

  const handleStartScanner = async (mode) => {
    scanLockRef.current = false;
    scanModeRef.current = mode;

    if (scanning) {
      await stopWebScan().catch(() => {});
    }

    setScanMode(mode);

    if (isNative) {
      await startNativeScan();
    } else {
      setScanning(true);
    }
  };

  const handleStopScanner = async () => {
    scanLockRef.current = true;
    scanModeRef.current = null;

    await stopWebScan().catch(() => {});

    setScanning(false);
    setScanMode(null);

    setTimeout(() => {
      scanLockRef.current = false;
    }, 500);
  };

  const handleSelectInventoryByInput = (value) => {
    setItemCodeInput(value);

    const found = findInventoryByCode(value);

    if (found) {
      setSelectedInventory(found);
      setItemCodeInput(found.code);
      setItemNameInput(found.name);
    } else {
      setSelectedInventory(null);
      setItemNameInput("");
    }
  };

  const handleAddBorrowItem = () => {
    const code = itemCodeInput.trim();
    const qty = Number(selectedQty);

    if (!code) {
      showToast("Kode barang wajib diisi");
      return;
    }

    const selected = selectedInventory || findInventoryByCode(code);

    if (!selected) {
      showToast("Kode barang tidak ditemukan di inventaris");
      return;
    }

    if (qty <= 0) {
      showToast("Jumlah harus lebih dari 0");
      return;
    }

    if (qty > Number(selected.available || 0)) {
      showToast("Jumlah melebihi stok tersedia");
      return;
    }

    const existingIndex = borrowList.findIndex(
      (item) => String(item.code) === String(selected.code)
    );

    if (existingIndex >= 0) {
      const updated = [...borrowList];
      const newQty = Number(updated[existingIndex].qty) + qty;

      if (newQty > Number(selected.available || 0)) {
        showToast("Total jumlah alat ini melebihi stok tersedia");
        return;
      }

      updated[existingIndex].qty = newQty;
      setBorrowList(updated);
    } else {
      setBorrowList((prev) => [
        ...prev,
        {
          inventoryId: selected.id,
          code: selected.code,
          name: selected.name,
          qty,
          available: selected.available,
        },
      ]);
    }

    setItemCodeInput("");
    setItemNameInput("");
    setSelectedInventory(null);
    setSelectedQty(1);
  };

  const handleRemoveBorrowItem = (index) => {
    setBorrowList((prev) => prev.filter((_, i) => i !== index));
  };

  const openPrintWindow = (qrItems) => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showToast("Popup print diblokir browser");
      return;
    }

    const html = qrItems
      .map(
        (item) => `
          <div class="card">
            <div class="title">QR Pengembalian</div>
            <div class="item">${item.itemName}</div>
            <div class="borrower">${item.borrower}</div>
            <div class="code">${item.code}</div>
            <img src="${item.qrImage}" />
          </div>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Pengembalian</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: white; }
            .wrapper { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
            .card { border: 1px solid #d1d5db; border-radius: 16px; padding: 16px; text-align: center; }
            .title { font-weight: bold; margin-bottom: 8px; }
            .item, .borrower, .code { font-size: 12px; margin-bottom: 4px; word-break: break-word; }
            img { width: 160px; height: 160px; object-fit: contain; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="wrapper">${html}</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleSaveBorrow = async () => {
    if (!borrowDate) {
      showToast("Tanggal pinjam wajib diisi");
      return;
    }

    if (!borrowerId.trim()) {
      showToast("ID peminjam wajib diisi");
      return;
    }

    if (borrowList.length === 0) {
      showToast("Tambahkan minimal 1 alat");
      return;
    }

    try {
      setSaving(true);

      const res = await createBorrow({
        waktu_pinjam: `${borrowDate} 08:00:00`,
        diambil_oleh: borrowerId.trim(),
        items: borrowList.map((item) => ({
          kode_aset: item.code,
          jumlah: item.qty,
        })),
      });

      const apiQrItems = res?.data?.data?.qrItems || [];

      const printItems = [];

      for (const qrItem of apiQrItems) {
        const qrImage = await QRCode.toDataURL(qrItem.code);
        printItems.push({
          code: qrItem.code,
          qrImage,
          itemName: qrItem.itemName,
          borrower: qrItem.borrower,
        });
      }

      if (printItems.length > 0) openPrintWindow(printItems);

      setBorrowDate(new Date().toISOString().split("T")[0]);
      setBorrowerId("");
      setBorrowerName("");
      setItemCodeInput("");
      setItemNameInput("");
      setSelectedInventory(null);
      setSelectedQty(1);
      setBorrowList([]);

      await loadData();
      showToast("Peminjaman berhasil disimpan", "success");
    } catch (error) {
      showToast(error?.response?.data?.message || "Gagal menyimpan peminjaman");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckScanCode = async () => {
    const code = scanCode.trim();

    if (!code) {
      showToast("Kode transaksi wajib diisi");
      return;
    }

    try {
      const res = await checkReturn(code);
      setScannedTransaction(res.data.data);
    } catch (err) {
      setScannedTransaction(null);
      showToast(
        err?.response?.data?.message ||
          "Kode tidak valid atau barang sudah dikembalikan"
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-[#0b1120]">
          <div className="text-slate-400 text-sm">Memuat data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full bg-[#0b1120] px-4 md:px-8 py-6 text-slate-100">
        <div className="space-y-6">
          {toast && (
            <div
              className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 min-w-[280px] max-w-[90vw] rounded-2xl border px-5 py-4 shadow-xl ${
                toast.type === "success"
                  ? "bg-emerald-950 border-emerald-500/40 text-emerald-300"
                  : toast.type === "warning"
                  ? "bg-amber-950 border-amber-500/40 text-amber-300"
                  : "bg-red-950 border-red-500/40 text-red-300"
              }`}
            >
              <span className="text-sm font-medium flex-1">{toast.text}</span>
              <button
                type="button"
                onClick={closeToast}
                className="shrink-0 text-current opacity-60 hover:opacity-100 text-lg leading-none"
              >
                ✕
              </button>
            </div>
          )}

          <div className="rounded-[28px] border border-blue-500/20 bg-gradient-to-r from-[#172554] via-[#1d4ed8] to-[#312e81] px-6 py-7 shadow-lg shadow-black/20">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Sistem Peminjaman Alat
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Total Stok" value={stats.totalStock} valueClass="text-white" />
            <StatCard title="Sedang Dipinjam" value={stats.totalBorrowed} valueClass="text-amber-400" />
            <StatCard title="Stok Tersedia" value={stats.totalAvailable} valueClass="text-emerald-400" />
          </div>

          <div className="rounded-[24px] border border-slate-700 bg-[#111827] p-2 shadow-sm">
            <div className="grid grid-cols-3 gap-2">
              <TabButton active={activeTab === "pinjam"} onClick={() => setActiveTab("pinjam")}>
                PINJAM
              </TabButton>
              <TabButton active={activeTab === "pengembalian"} onClick={() => setActiveTab("pengembalian")}>
                PENGEMBALIAN
              </TabButton>
              <TabButton active={activeTab === "riwayat"} onClick={() => setActiveTab("riwayat")}>
                RIWAYAT
              </TabButton>
            </div>
          </div>

          {activeTab === "pinjam" && (
            <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6">
              <div className="rounded-[28px] border border-slate-700 bg-[#111827] overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#4338ca] to-[#1d4ed8] px-6 py-6 text-white">
                  <h2 className="text-2xl font-bold uppercase tracking-wide">
                    Form Peminjaman Alat
                  </h2>
                </div>

                <div className="p-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <InputGroup label="Tanggal Pinjam">
                      <input
                        type="date"
                        value={borrowDate}
                        onChange={(e) => setBorrowDate(e.target.value)}
                        className="w-full rounded-2xl border border-slate-600 bg-[#0f172a] px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      />
                    </InputGroup>

                    <InputGroup label="ID Peminjam">
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={borrowerId}
                            onChange={(e) => {
                              setBorrowerId(e.target.value);
                              setBorrowerName("");
                            }}
                            onBlur={() => {
                              if (borrowerId.trim()) {
                                fetchBorrowerById(borrowerId.trim());
                              }
                            }}
                            placeholder="Scan ID card atau ketik ID karyawan"
                            className="w-full rounded-2xl border border-slate-600 bg-[#0f172a] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleStartScanner("borrower")}
                            className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 shrink-0"
                          >
                            Scan
                          </button>
                        </div>

                        {!isNative && scanning && scanMode === "borrower" && (
                          <div className="rounded-2xl border border-slate-700 bg-black p-3">
                            <div
                              id="reader-borrower-inline"
                              className="w-full min-h-[240px] overflow-hidden rounded-xl"
                            />
                            <button
                              onClick={handleStopScanner}
                              className="mt-3 w-full rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500"
                            >
                              Stop Scan
                            </button>
                          </div>
                        )}
                      </div>
                    </InputGroup>

                    <InputGroup label="Nama Peminjam">
                      <input
                        type="text"
                        value={borrowerName}
                        onChange={(e) => setBorrowerName(e.target.value)}
                        placeholder="Otomatis dari scan atau ketik manual"
                        className="w-full rounded-2xl border border-slate-600 bg-[#0f172a] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                      />
                    </InputGroup>
                  </div>

                  <div className="rounded-[24px] border border-dashed border-slate-600 bg-[#0f172a] p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Input Detail Alat</h3>
                        <p className="text-sm text-slate-400">
                          Isi kode barang, nama barang akan muncul otomatis
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <InputGroup label="Kode Barang">
                        <input
                          type="text"
                          value={itemCodeInput}
                          onChange={(e) => handleSelectInventoryByInput(e.target.value)}
                          placeholder="Cth: 0001"
                          className="w-full rounded-2xl border border-slate-600 bg-[#111827] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        />

                        {selectedInventory && (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                            Stok: {selectedInventory.stock} | Tersedia:{" "}
                            {selectedInventory.available}
                          </div>
                        )}
                      </InputGroup>

                      <InputGroup label="Nama Barang">
                        <input
                          type="text"
                          value={itemNameInput}
                          readOnly
                          placeholder="Otomatis dari kode barang"
                          className="w-full rounded-2xl border border-slate-600 bg-[#111827] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none"
                        />
                      </InputGroup>

                      <InputGroup label="Jumlah">
                        <input
                          type="number"
                          min="1"
                          value={selectedQty}
                          onChange={(e) => setSelectedQty(e.target.value)}
                          className="w-full rounded-2xl border border-slate-600 bg-[#111827] px-4 py-3 text-slate-100 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                        />
                      </InputGroup>

                      <div className="flex items-end">
                        <button
                          onClick={handleAddBorrowItem}
                          className="w-full rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-500"
                        >
                          Tambah
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-700 overflow-hidden">
                    <div className="border-b border-slate-700 bg-[#0f172a] px-5 py-4">
                      <h3 className="text-lg font-semibold text-white">Daftar Alat Dipinjam</h3>
                      <p className="text-sm text-slate-400">
                        Periksa daftar alat sebelum simpan
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-sm">
                        <thead className="bg-[#111827] text-slate-400">
                          <tr>
                            <th className="px-5 py-4 text-left font-semibold">Kode</th>
                            <th className="px-5 py-4 text-left font-semibold">Nama Barang</th>
                            <th className="px-5 py-4 text-left font-semibold">Jumlah</th>
                            <th className="px-5 py-4 text-left font-semibold">Stok Tersedia</th>
                            <th className="px-5 py-4 text-center font-semibold">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {borrowList.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="px-5 py-12 text-center text-slate-500">
                                Belum ada alat yang ditambahkan.
                              </td>
                            </tr>
                          ) : (
                            borrowList.map((item, index) => (
                              <tr key={`${item.code}-${index}`} className="border-t border-slate-700">
                                <td className="px-5 py-4 font-mono text-slate-300">{item.code}</td>
                                <td className="px-5 py-4 font-medium text-slate-100">{item.name}</td>
                                <td className="px-5 py-4 text-slate-300">{item.qty} unit</td>
                                <td className="px-5 py-4 text-slate-300">{item.available}</td>
                                <td className="px-5 py-4 text-center">
                                  <button
                                    onClick={() => handleRemoveBorrowItem(index)}
                                    className="rounded-xl bg-red-500/10 px-3 py-2 text-red-400 hover:bg-red-500/20"
                                  >
                                    Hapus
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-[24px] border border-slate-700 bg-[#0f172a] px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-white">Total item dalam daftar</p>
                      <p className="text-sm text-slate-400">
                        {borrowList.reduce((sum, item) => sum + Number(item.qty || 0), 0)} alat akan diproses
                      </p>
                    </div>

                    <button
                      onClick={handleSaveBorrow}
                      disabled={saving || borrowList.length === 0}
                      className={`rounded-2xl px-6 py-3 font-semibold text-white ${
                        saving || borrowList.length === 0
                          ? "cursor-not-allowed bg-slate-600"
                          : "bg-indigo-600 hover:bg-indigo-500"
                      }`}
                    >
                      {saving ? "Menyimpan..." : "Simpan Peminjaman"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Panel title="Ringkasan Cepat">
                  <div className="space-y-4">
                    <MiniCard label="Tanggal" value={borrowDate || "-"} />
                    <MiniCard
                      label="Peminjam"
                      value={
                        borrowerId
                          ? borrowerName
                            ? `${borrowerId} • ${borrowerName}`
                            : borrowerId
                          : "-"
                      }
                    />
                    <MiniCard label="Jumlah Jenis Alat" value={borrowList.length} />
                    <MiniCard
                      label="Total Unit"
                      value={borrowList.reduce(
                        (sum, item) => sum + Number(item.qty || 0),
                        0
                      )}
                    />
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {activeTab === "pengembalian" && (
            <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
              <div className="rounded-[28px] border border-slate-700 bg-[#111827] overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-[#0f766e] to-[#2563eb] px-6 py-6 text-white">
                  <h2 className="text-2xl font-bold uppercase tracking-wide">
                    Pengembalian Barang
                  </h2>
                  <p className="mt-1 text-cyan-100">
                    Scan atau input kode transaksi untuk proses pengembalian
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="rounded-[24px] border border-dashed border-slate-600 bg-[#0f172a] p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-600 text-white font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Scan Kode Pengembalian
                        </h3>
                        <p className="text-sm text-slate-400">
                          Tempel hasil scan QR atau ketik kode PMJ-...
                        </p>
                      </div>
                    </div>

                    <InputGroup label="Kode Transaksi">
                      <div className="space-y-3">
                        <div className="flex flex-col md:flex-row gap-3">
                          <input
                            ref={scanRef}
                            type="text"
                            value={scanCode}
                            onChange={(e) => setScanCode(e.target.value)}
                            placeholder="Scan QR atau ketik kode PMJ-..."
                            className="w-full rounded-2xl border border-slate-600 bg-[#111827] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleStartScanner("return")}
                            className="rounded-2xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-500 shrink-0"
                          >
                            Scan QR
                          </button>
                          <button
                            type="button"
                            onClick={handleCheckScanCode}
                            className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 shrink-0"
                          >
                            Cek
                          </button>
                        </div>

                        {!isNative && scanning && scanMode === "return" && (
                          <div className="rounded-2xl border border-slate-700 bg-black p-3">
                            <div
                              id="reader-return-inline"
                              className="w-full min-h-[240px] overflow-hidden rounded-xl"
                            />
                            <button
                              onClick={handleStopScanner}
                              className="mt-3 w-full rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500"
                            >
                              Stop Scan
                            </button>
                          </div>
                        )}
                      </div>
                    </InputGroup>
                  </div>

                  <div className="rounded-[24px] border border-slate-700 bg-[#0f172a] p-5">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white">Hasil Scan</h3>
                      <p className="text-sm text-slate-400">
                        Detail transaksi yang akan dikembalikan
                      </p>
                    </div>

                    {scannedTransaction ? (
                      <div className="space-y-4">
                        <InfoRow label="Kode Transaksi" value={scannedTransaction.transactionCode} />
                        <InfoRow label="Nama Barang" value={scannedTransaction.itemName} />
                        <InfoRow label="Peminjam" value={scannedTransaction.borrower} />
                        <InfoRow
                          label="Tanggal Pinjam"
                          value={
                            scannedTransaction.borrowDate
                              ? new Date(scannedTransaction.borrowDate).toLocaleString("id-ID")
                              : "-"
                          }
                        />
                        <div className="pt-2">
                          <button
                            onClick={() => processReturnTransaction(scannedTransaction)}
                            className="w-full rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500"
                          >
                            Proses Pengembalian
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-700 bg-[#111827] px-4 py-8 text-center text-slate-500">
                        Belum ada transaksi yang dipilih.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-700 bg-[#111827] p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Barang Yang Masih Dipinjam
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Daftar transaksi aktif yang bisa dikembalikan
                  </p>
                </div>

                <div className="space-y-4">
                  {borrowedItems.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-slate-600 py-16 text-center text-slate-500">
                      Tidak ada barang yang sedang dipinjam.
                    </div>
                  ) : (
                    borrowedItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[24px] border border-slate-700 bg-[#0f172a] p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {item.itemName}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              Peminjam: {item.borrower}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Kode: {item.transactionCode}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 lg:items-end">
                            <div className="text-sm text-slate-400">
                              Pinjam:{" "}
                              {item.borrowDate
                                ? new Date(item.borrowDate).toLocaleString("id-ID")
                                : "-"}
                            </div>
                            <StatusBadge status={item.status} />
                            <button
                              onClick={() => processReturnTransaction(item)}
                              className="mt-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                            >
                              Kembalikan
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "riwayat" && (
            <div className="rounded-[28px] border border-slate-700 bg-[#111827] p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white">
                  Riwayat Peminjaman
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {history.length} transaksi tercatat
                </p>
              </div>

              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-slate-600 py-16 text-center text-slate-500">
                    Belum ada transaksi peminjaman.
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-slate-700 bg-[#0f172a] p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {item.itemName}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            Peminjam: {item.borrower}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Kode: {item.transactionCode}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-slate-400 lg:items-end">
                          {item.borrowDate && (
                            <div>
                              Pinjam:{" "}
                              {new Date(item.borrowDate).toLocaleString("id-ID")}
                            </div>
                          )}
                          {item.returnDate && (
                            <div>
                              Kembali:{" "}
                              {new Date(item.returnDate).toLocaleString("id-ID")}
                            </div>
                          )}
                          <StatusBadge status={item.status} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl py-3 text-sm font-semibold transition ${
        active ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value, valueClass }) {
  return (
    <div className="rounded-[24px] border border-slate-700 bg-[#111827] p-6 shadow-sm">
      <div className="text-sm text-slate-400">{title}</div>
      <div className={`mt-3 text-3xl font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

function InputGroup({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-[24px] border border-slate-700 bg-[#111827] p-6 shadow-sm">
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#0f172a] px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-100 break-words">
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-[#111827] px-4 py-3">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-100 break-words">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    borrowed: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    returned: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    damaged: "bg-red-500/10 text-red-400 border border-red-500/20",
    lost: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
  };

  const labels = {
    borrowed: "Dipinjam",
    returned: "Dikembalikan",
    damaged: "Rusak",
    lost: "Hilang",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-800 text-slate-300 border border-slate-700"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}