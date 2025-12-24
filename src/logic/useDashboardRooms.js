import { useEffect, useState } from "react";
import { mapDeviceStatusToMode } from "./deviceStatus";

/* =========================
   MAP + SORT DATA RUANGAN
========================= */
function mapAndSortRooms(data) {
  return data
    .map((item) => {
      const temp = Math.round(item.suhu ?? 0);

      let tempStatus = "normal";
      let priority = 2;

      if (temp >= 28) {
        tempStatus = "danger";
        priority = 0;
      } else if (temp >= 25 && temp <= 27) {
        tempStatus = "warning";
        priority = 1;
      }

      return {
        no: String(item.id_ruangan_gedung).padStart(2, "0"),
        room: item.nama_ruangan,

        temp,
        rh: Math.round(item.kelembapan ?? 0),
        lumens: Math.round(item.cahaya ?? 0),

        tempStatus,
        priority,

        // 🔥 status LANGSUNG dari API
        deviceMode: mapDeviceStatusToMode(item.status_alat),
      };
    })
    // 🔥 SORTING WAJIB
    .sort((a, b) => {
      // 1️⃣ Prioritas (danger → warning → normal)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      // 2️⃣ Suhu tertinggi di atas
      return b.temp - a.temp;
    });
}

/* =========================
   HOOK DASHBOARD
========================= */
export function useDashboardRooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:4000/api/monitoring/dashboard")
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            setRooms(mapAndSortRooms(res.data));
          }
        })
        .catch(console.error);
    };

    fetchData();
    const i = setInterval(fetchData, 3000);
    return () => clearInterval(i);
  }, []);

  return rooms;
}
