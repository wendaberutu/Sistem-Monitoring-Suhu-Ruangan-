import { useState, useCallback } from 'react';
import {
  getSavedPrinter,
  savePrinter,
  clearSavedPrinter,
  printServiceTicket,
  isNative,
} from '../services/printer.service';

export function usePrinter() {
  const [printer, setPrinter]       = useState(() => getSavedPrinter());
  const [showModal, setShowModal]   = useState(false);
  const [printing, setPrinting]     = useState(false);
  const [printError, setPrintError] = useState(null);

  const selectPrinter = useCallback((device) => {
    savePrinter(device);
    setPrinter(device);
    setShowModal(false);
  }, []);

  const forgetPrinter = useCallback(() => {
    clearSavedPrinter();
    setPrinter(null);
  }, []);

  const printJob = useCallback(async (job) => {
    setPrintError(null);

    if (!isNative()) {
      window.print();
      return true;
    }

    if (!getSavedPrinter()) {
      setShowModal(true);
      return false;
    }

    setPrinting(true);
    try {
      await printServiceTicket(job);
      return true;
    } catch (err) {
      const code = err?.message;
      const msg =
        code === 'NO_PRINTER_SELECTED'        ? 'Belum ada printer dipilih.' :
        code === 'BLUETOOTH_PERMISSION_DENIED' ? 'Izin Bluetooth ditolak. Buka Pengaturan → Izin Aplikasi → Bluetooth dan aktifkan.' :
        (code || 'Gagal cetak. Pastikan printer menyala dan Bluetooth aktif.');
      setPrintError(msg);
      return false;
    } finally {
      setPrinting(false);
    }
  }, []);

  return {
    printer,
    printing,
    printError,
    showModal,
    setShowModal,
    selectPrinter,
    forgetPrinter,
    printJob,
  };
}
