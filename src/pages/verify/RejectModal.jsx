import { useState } from "react";

export default function RejectModal({ job, onClose, onSubmit }) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-50 bg-black/70
      flex items-center justify-center">

      <div className="bg-[#020617] w-full max-w-md rounded-2xl p-6
        border border-red-500/30 shadow-2xl">

        <h2 className="text-xl font-semibold text-red-400 mb-4">
          Konfirmasi Penolakan
        </h2>

        <p className="text-sm text-blue-200/70 mb-4">
          Laporan akan dikembalikan ke teknisi.
          Mohon isi alasan penolakan.
        </p>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={4}
          className="w-full p-4 rounded-xl
          bg-[#0b1325]
          border border-red-500/20
          focus:outline-none focus:border-red-500"
          placeholder="Alasan penolakan..."
        />

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-white"
          >
            Batal
          </button>

          <button
            onClick={() => onSubmit(note)}
            disabled={!note.trim()}
            className="px-6 py-2 rounded-xl font-semibold
            bg-red-600 hover:bg-red-700
            disabled:opacity-40"
          >
            Tolak Laporan
          </button>
        </div>

      </div>
    </div>
  );
}