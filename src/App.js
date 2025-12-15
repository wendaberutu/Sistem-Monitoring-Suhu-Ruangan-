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
    temp: 20,
    rh: 74,
    lumens: 460,
  }));

  // 15 card per page (5 kolom × 3 baris)
  const pages = chunkArray(rooms, 15);

  return (
    <>
      <AppNavbar />

      <div className="tv-viewport">
        <div className="tv-pages">
          {pages.map((page, pageIndex) => (
            <div className="tv-page" key={pageIndex}>
              {page.map((r) => (
                <RoomCard
                  key={r.no}
                  no={r.no}
                  temp={r.temp}
                  rh={r.rh}
                  lumens={r.lumens}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
