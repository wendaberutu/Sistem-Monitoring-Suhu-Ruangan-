import { useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * Hook universal scanner QR.
 * - Di Android (Capacitor native): menggunakan MLKit barcode scanner bawaan.
 * - Di browser (web): menggunakan html5-qrcode dengan kamera WebRTC.
 *
 * @param {(uid: string) => Promise<void>} onScan - callback dipanggil saat QR berhasil dibaca
 * @returns {{ isNative, scanning, startScan, stopScan }}
 */
export function useQRScanner(onScan) {
  const html5QrRef = useRef(null);
  const scanningRef = useRef(false);
  const isNative = Capacitor.isNativePlatform();

  // ────────────────────────────────────────────────
  // NATIVE (Android) – pakai MLKit via plugin
  // ────────────────────────────────────────────────
  const startNativeScan = useCallback(async () => {
    try {
      const { BarcodeScanner, BarcodeFormat } = await import(
        "@capacitor-mlkit/barcode-scanning"
      );

      // Minta izin kamera
      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== "granted") {
        alert("Izin kamera ditolak. Aktifkan di pengaturan aplikasi.");
        return;
      }

      // Buka native scanner (full-screen overlay)
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      if (barcodes && barcodes.length > 0) {
        await onScan(barcodes[0].rawValue.trim());
      }
    } catch (err) {
      if (err?.message?.includes("cancel")) return; // user cancel = ok
      console.error("Native scan error:", err);
      alert("Gagal membuka scanner: " + (err?.message || "error tidak diketahui"));
    }
  }, [onScan]);

  // ────────────────────────────────────────────────
  // WEB – pakai html5-qrcode dengan DOM element
  // ────────────────────────────────────────────────
  const stopWebScan = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        await html5QrRef.current.clear();
      } catch {}
      html5QrRef.current = null;
    }
    scanningRef.current = false;
  }, []);

  const startWebScan = useCallback(
    async (elementId) => {
      if (scanningRef.current) return;

      const element = document.getElementById(elementId);
      if (!element) {
        console.error("Element tidak ditemukan:", elementId);
        return;
      }

      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode(elementId);
      html5QrRef.current = qr;
      scanningRef.current = true;

      try {
        await qr.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            if (!scanningRef.current) return;
            await onScan(decodedText.trim());
          }
        );
      } catch (err) {
        console.error("Web scanner error:", err);
        scanningRef.current = false;
        throw err;
      }
    },
    [onScan]
  );

  // ────────────────────────────────────────────────
  // PUBLIC API
  // ────────────────────────────────────────────────
  return {
    isNative,
    /** Mulai scan (native: buka overlay, web: perlu element DOM) */
    startNativeScan,
    startWebScan,
    stopWebScan,
  };
}
