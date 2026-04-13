import { useRef, useCallback } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";

// Daftarkan custom ZXing plugin
const ZxingScanner = registerPlugin("ZxingScanner");

/**
 * Hook universal scanner QR.
 * - Di Android (Capacitor native): menggunakan ZXing via native plugin (tidak butuh Google).
 * - Di browser (web): menggunakan html5-qrcode dengan kamera WebRTC.
 *
 * @param {(uid: string) => Promise<void>} onScan - callback dipanggil saat QR berhasil dibaca
 */
export function useQRScanner(onScan) {
  const html5QrRef = useRef(null);
  const scanningRef = useRef(false);
  const isNative = Capacitor.isNativePlatform();

  // ────────────────────────────────────────────────
  // NATIVE (Android) – pakai ZXing via custom plugin
  // ────────────────────────────────────────────────
  const startNativeScan = useCallback(async () => {
    try {
      const result = await ZxingScanner.scan();
      if (result?.text) {
        await onScan(result.text.trim());
      }
    } catch (err) {
      if (err?.message?.includes("dibatalkan") || err?.message?.includes("cancel")) return;
      console.error("ZXing scan error:", err);
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
    startNativeScan,
    startWebScan,
    stopWebScan,
  };
}
