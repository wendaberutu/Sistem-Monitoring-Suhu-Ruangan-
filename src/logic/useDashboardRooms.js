import { useEffect, useState } from "react";
import {
  getDeviceStatus,
  mapDeviceStatusToMode,
} from "./deviceStatus";

function mapAndSortRooms(data) {
  return data.map((item) => {
    const temp = Math.round(item.suhu);
    let tempStatus = "normal";
    let priority = 2;

    if (temp >= 23) {
      tempStatus = "danger";
      priority = 0;
    } else if (temp >= 20 && temp <= 22) {
      tempStatus = "warning";
      priority = 1;
    }

    const deviceStatus = getDeviceStatus(
      item.waktu_pengambilan_data
    );

    return {
      no: String(item.id_ruangan_gedung).padStart(2, "0"),
      room: item.ruang,
      temp,
      rh: Math.round(item.kelembapan),
      lumens: Math.round(item.cahaya),

      tempStatus,
      priority,

      deviceMode: mapDeviceStatusToMode(deviceStatus),
    };
  });
}

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
        });
    };

    fetchData();
    const i = setInterval(fetchData, 3000);
    return () => clearInterval(i);
  }, []);

  return rooms;
}
