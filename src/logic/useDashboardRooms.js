import { useEffect, useState } from "react";
import { mapDeviceStatusToMode } from "./deviceStatus";

/* =========================
   HELPER STATUS SUHU
========================= */
function getTempStatus(temp, maxTemp) {
  if (!maxTemp || maxTemp <= 0) {
    return { tempStatus: "normal", priority: 2 };
  }

  if (temp >= maxTemp) {
    return { tempStatus: "danger", priority: 0 };
  }

  if (temp >= maxTemp - 2) {
    return { tempStatus: "warning", priority: 1 };
  }

  return { tempStatus: "normal", priority: 2 };
}

/* =========================
   MAP + SORT DATA RUANGAN
========================= */
function mapAndSortRooms(data) {
  return data
    .map((item) => {
      const temp = Math.round(item.suhu ?? 0);
      const maxTemp = Number(item.maksimal_suhu ?? 0);

      const { tempStatus, priority } = getTempStatus(temp, maxTemp);

      return {
        no: String(item.id_ruangan_gedung).padStart(2, "0"),
        room: item.nama_ruangan,

        temp,
        maxTemp,

        rh: Math.round(item.kelembapan ?? 0),
        lumens: Math.round(item.cahaya ?? 0),

        tempStatus,
        priority,

        deviceMode: mapDeviceStatusToMode(item.status_alat),
      };
    })
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
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
       fetch(`${process.env.REACT_APP_API_URL}/api/monitoring/dashboard`)
        .then((res) => res.json())
        .then((res) => {
          if (res?.success && Array.isArray(res.data)) {
            setRooms(mapAndSortRooms(res.data));
          }
        })
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  return rooms;
}
