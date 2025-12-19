import { useEffect, useState } from "react";
import AppNavbar from "./components/AppNavbar";
import RoomCard from "./components/RoomCard";
import "./App.css";

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function App() {
  const [rooms, setRooms] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:4000/api/monitoring/dashboard")
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            const mapped = res.data.map((item) => {
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

              return {
                // ✅ IDENTITAS TETAP
                key: item.id_alat_monitor_suhu_kelembapan,
                roomId: item.id_ruangan_gedung,
                deviceId: item.id_alat_monitor_suhu_kelembapan,

                // ✅ DISPLAY
                no: String(item.id_ruangan_gedung).padStart(2, "0"),
                room: item.ruang,

                temp,
                rh: Math.round(item.kelembapan),
                lumens: Math.round(item.cahaya),

                tempStatus,
                priority,
              };
            });


            // ⬅️ URUTKAN BERDASARKAN STATUS
            mapped.sort((a, b) => a.priority - b.priority);

            setRooms(mapped);
          }
        })
        .catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const pages = chunkArray(rooms, 15);

  const prev = () => setPageIndex((p) => Math.max(0, p - 1));
  const next = () => setPageIndex((p) => Math.min(pages.length - 1, p + 1));

  return (
    <>
      <AppNavbar />

      <div className="tv-wrapper">
        <button className="nav-btn left" onClick={prev}>
          &laquo;
        </button>

        <div className="tv-viewport">
          <div
            className="tv-pages"
            style={{
              transform: `translateX(-${pageIndex * 100}%)`,
            }}
          >
            {pages.map((page, i) => (
              <div className="tv-page" key={i}>
                {page.map((r) => (
                  <RoomCard
                    key={r.no}
                    no={r.no}
                    room={r.room}
                    temp={r.temp}
                    rh={r.rh}
                    lumens={r.lumens}
                    tempStatus={r.tempStatus}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <button className="nav-btn right" onClick={next}>
          &raquo;
        </button>
      </div>
    </>
  );
}

export default App;
