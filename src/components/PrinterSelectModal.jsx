import { useState } from 'react';

/**
 * Modal untuk input MAC address printer Bluetooth.
 * MAC address disimpan di localStorage dan hanya perlu diisi sekali.
 *
 * Props:
 *   onSelect({ name, address }) – dipanggil saat user simpan
 *   onClose()                   – dipanggil saat user klik Batal
 */
export default function PrinterSelectModal({ onSelect, onClose }) {
  const [name, setName]       = useState('');
  const [address, setAddress] = useState('');
  const [error, setError]     = useState('');

  const MAC_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

  const handleSave = () => {
    const trimmed = address.trim().toUpperCase();
    if (!MAC_REGEX.test(trimmed)) {
      setError('Format tidak valid. Contoh: DC:0D:30:AA:BB:CC');
      return;
    }
    onSelect({ name: name.trim() || trimmed, address: trimmed });
  };

  // Auto-format saat user mengetik — tambah titik dua otomatis
  const handleAddressChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^0-9A-F:]/g, '');
    // Tambah ':' otomatis setiap 2 karakter (jika user tidak ketik sendiri)
    val = val.replace(/:/g, '');
    if (val.length > 12) val = val.slice(0, 12);
    const formatted = val.match(/.{1,2}/g)?.join(':') || val;
    setAddress(formatted);
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div className="bg-slate-900 w-full max-w-sm rounded-xl p-6 shadow-2xl border border-white/10 mx-4">

        <h2 className="text-lg font-bold text-white mb-1">Pengaturan Printer Bluetooth</h2>
        <p className="text-xs text-slate-400 mb-5">
          Masukkan MAC address printer. Cek di Settings Android → Bluetooth → nama printer → Detail.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 block mb-1">Nama Printer (opsional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Blue Print Lite80D1"
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-1">MAC Address Printer <span className="text-rose-400">*</span></label>
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              placeholder="DC:0D:30:AA:BB:CC"
              maxLength={17}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 text-white border border-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
            <p className="text-slate-500 text-xs mt-1">
              Format: XX:XX:XX:XX:XX:XX (6 pasang huruf/angka)
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-slate-700 text-white text-sm hover:bg-slate-600 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={address.length < 17}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-40 transition"
          >
            Simpan
          </button>
        </div>

      </div>
    </div>
  );
}
