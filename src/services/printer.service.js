import { LidtaCapacitorBlPrinter } from 'lidta-capacitor-bl-printer';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';

const STORAGE_KEY = 'bt_printer_device';

// ─── Device storage ───────────────────────────────────────────────────────────

export function getSavedPrinter() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function savePrinter(device) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(device));
}

export function clearSavedPrinter() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isNative() {
  return Capacitor.isNativePlatform();
}

// ─── Render HTML receipt → base64 image ──────────────────────────────────────

function buildReceiptHTML(job) {
  const date = job.date || new Date().toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const row = (label, value) =>
    `<tr>
      <td style="padding:1px 4px 1px 0; white-space:nowrap; vertical-align:top;">${label}</td>
      <td style="padding:1px 4px; vertical-align:top;">:</td>
      <td style="padding:1px 0; word-break:break-word;">${value || '-'}</td>
    </tr>`;

  const qrImg = job.qr
    ? `<img src="${job.qr}" style="width:130px; height:130px; display:block; margin:4px auto;" />`
    : '';

  return `
    <div id="thermal-receipt" style="
      width: 302px;
      background: white;
      color: black;
      font-family: Arial, sans-serif;
      font-size: 11px;
      padding: 10px 12px 14px;
      box-sizing: border-box;
      text-align: center;
    ">
      <!-- Header -->
      <div style="font-weight:bold; font-size:13px; letter-spacing:0.5px;">WALETA MAINTENANCE</div>
      <div style="font-size:10px; color:#444; margin-bottom:6px;">Penerimaan Servis</div>
      <div style="border-top:1px solid #000; margin-bottom:6px;"></div>

      <!-- UID + QR -->
      <div style="font-weight:bold; font-size:12px; margin-bottom:4px;">${job.qr_code_uid}</div>
      ${qrImg}
      <div style="font-weight:bold; font-size:12px; margin-top:4px;">ID: ${job.id}</div>

      <div style="border-top:1px solid #000; margin:8px 0 6px;"></div>

      <!-- Detail rows -->
      <table style="width:100%; font-size:11px; text-align:left; border-collapse:collapse;">
        <tbody>
          ${row('Tanggal', date)}
          ${row('Nama Barang', job.item_name)}
          ${row('Penyetor', job.nama_penyetor)}
          ${row('Teknisi', job.technician_name || 'Belum ditentukan')}
          ${row('Issue', job.reported_issue)}
        </tbody>
      </table>
    </div>
  `;
}

async function htmlToBase64(html) {
  // Buat container tersembunyi di luar layar
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed; left:-9999px; top:0; z-index:-1;';
  container.innerHTML = html;
  document.body.appendChild(container);

  const el = container.querySelector('#thermal-receipt');

  try {
    const canvas = await html2canvas(el, {
      backgroundColor: '#ffffff',
      scale: 2,          // resolusi lebih tinggi
      useCORS: true,
      logging: false,
    });
    // Ambil base64 tanpa prefix "data:image/png;base64,"
    return canvas.toDataURL('image/png').split(',')[1];
  } finally {
    document.body.removeChild(container);
  }
}

// ─── Print ────────────────────────────────────────────────────────────────────

async function ensureBluetoothPermission() {
  // Hanya perlu request di native Android; di web tidak perlu
  if (!isNative()) return;

  // Cek terlebih dahulu, kalau sudah granted skip request
  const check = await LidtaCapacitorBlPrinter.checkPermissions().catch(() => null);
  if (check?.bluetooth === 'granted') return;

  // Minta izin ke user (Android 12+ tampilkan dialog, Android 11 langsung granted)
  const result = await LidtaCapacitorBlPrinter.requestPermissions();
  if (result?.bluetooth !== 'granted') {
    throw new Error('BLUETOOTH_PERMISSION_DENIED');
  }
}

export async function printServiceTicket(job) {
  const saved = getSavedPrinter();
  if (!saved) throw new Error('NO_PRINTER_SELECTED');

  await ensureBluetoothPermission();

  const base64 = await htmlToBase64(buildReceiptHTML(job));

  await LidtaCapacitorBlPrinter.connect({ address: saved.address });
  try {
    await LidtaCapacitorBlPrinter.printBase64({ msg: base64, align: 1 });
  } finally {
    await LidtaCapacitorBlPrinter.disconnect();
  }
}
