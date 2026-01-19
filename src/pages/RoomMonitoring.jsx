import { useState } from "react";
import RoomCard from "../components/RoomCard";
import chunkArray from "../logic/chunkArray";
import { useDashboardRooms } from "../logic/useDashboardRooms";
import { fillPage } from "../logic/fillPage";
import "../App.css";

const PAGE_SIZE = 24;

export default function RoomMonitoring() {
  const rooms = useDashboardRooms();
  const [pageIndex, setPageIndex] = useState(0);

  const pages = chunkArray(rooms, PAGE_SIZE);

  const prev = () => setPageIndex(p => Math.max(0, p - 1));
  const next = () =>
    setPageIndex(p => Math.min(pages.length - 1, p + 1));

  return (
    <div className="tv-wrapper">
      <button
        className="nav-btn left"
        onClick={prev}
        disabled={pageIndex === 0}
      >
        &laquo;
      </button>

      <div className="tv-viewport">
        <div
          className="tv-pages"
          style={{ transform: `translateX(-${pageIndex * 100}%)` }}
        >
          {pages.map((page, i) => {
            const filledPage = fillPage(page, PAGE_SIZE);

            return (
              <div className="tv-page" key={i}>
                {filledPage.map((r, idx) => (
                  <RoomCard
                    key={
                      r.deviceMode === "empty"
                        ? `empty-${i}-${idx}`
                        : r.no
                    }
                    {...r}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="nav-btn right"
        onClick={next}
        disabled={pageIndex === pages.length - 1}
      >
        &raquo;
      </button>
    </div>
  );
}
