import { useState } from "react";
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
const rooms = Array.from({ length: 28 }, (_, i) => ({
  no: String(i + 1).padStart(2, "0"),
  room: `RUANG ${i + 1}`,   // ⬅️ INI
  temp: 20,
  rh: 74,
  lumens: 460,
}));


  const pages = chunkArray(rooms, 15);
  const [pageIndex, setPageIndex] = useState(0);

  const prev = () =>
    setPageIndex((p) => Math.max(0, p - 1));
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
