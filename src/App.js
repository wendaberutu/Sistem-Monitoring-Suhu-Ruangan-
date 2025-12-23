import { useState } from "react";
import AppNavbar from "./components/AppNavbar";
import RoomCard from "./components/RoomCard";
import chunkArray from "./logic/chunkArray";
import { useDashboardRooms } from "./logic/useDashboardRooms";
import "./App.css";

export default function App() {
  const rooms = useDashboardRooms();
  const [pageIndex, setPageIndex] = useState(0);
  const pages = chunkArray(rooms, 15);

  const prev = () => setPageIndex((p) => Math.max(0, p - 1));
  const next = () =>
    setPageIndex((p) => Math.min(pages.length - 1, p + 1));

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
            style={{ transform: `translateX(-${pageIndex * 100}%)` }}
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
                    tempStatus={r.tempStatus}   // 🔥 tetap
                    deviceMode={r.deviceMode}   // ⚙️ baru
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
