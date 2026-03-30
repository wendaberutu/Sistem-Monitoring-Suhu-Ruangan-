import { useMemo } from "react";
import "../App.css";

export default function WaterMonitoring() {
  const sections = useMemo(
    () => [
      {
        title: "WTP A",
        tanks: [
          { name: "Tank 1", level: 55, color: "cyan" },
          { name: "Tank 2", level: 55, color: "cyan" },
          { name: "Tank 3", level: 25, color: "orange" },
        ],
        systems: [
          {
            name: "R.O System",
            iconLabel: "RO",
            tds: "120 ppm",
            flow: "17.6 m³/h",
            total: "4,930 m³",
          },
        ],
        footerMetric: { label: "TDS Summary", value: "120 ppm" },
      },
      {
        title: "WTP B & C",
        tanks: [
          { name: "Tank 1", level: 80, color: "blue" },
          { name: "Tank 2", level: 65, color: "orange" },
        ],
        systems: [
          {
            name: "R.O System",
            iconLabel: "RO",
            tds: "115 ppm",
            flow: "14.2 m³/h",
            total: "4,930 m³",
          },
        ],
        footerMetric: { label: "TDS Summary", value: "115 ppm" },
      },
      {
        title: "WTP E",
        tanks: [
          { name: "Tank 1", level: 55, color: "blue" },
          { name: "Tank 2", level: 75, color: "yellow" },
        ],
        systems: [
          {
            name: "R.O System 1",
            iconLabel: "RO1",
            tds: "110 ppm",
            flow: "16.2 m³/h",
            total: "3,180 m³",
          },
          {
            name: "R.O System 2",
            iconLabel: "RO2",
            tds: "108 ppm",
            flow: "15.4 m³/h",
            total: "2,942 m³",
          },
        ],
        grandTotal: "6,122 m³",
      },
    ],
    []
  );

  const modeClass = {
    frame: "p-2 md:p-3",
    shell: "rounded-[18px] p-3",
    title: "text-[18px] md:text-[24px]",
    grid: "gap-3",
    content: "p-3 gap-3",
    tankHeight: "h-[78px] md:h-[96px]",
    tankName: "text-[11px] md:text-[12px]",
    cardTitle: "text-[12px] md:text-[13px]",
    text: "text-[11px] md:text-[12px]",
    value: "text-[13px] md:text-[15px]",
    total: "text-[16px] md:text-[18px]",
  };

  return (
    <div className="h-[calc(100vh-56px)] w-full bg-[linear-gradient(180deg,#edf4fb_0%,#e8effa_100%)] text-slate-700">
      <div className={`h-full w-full ${modeClass.frame}`}>
        <div
          className={`flex h-full w-full flex-col border border-white/70 bg-white/70 shadow-[0_18px_50px_rgba(30,64,175,0.08)] backdrop-blur-sm ${modeClass.shell}`}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
          </div>

          <div className="mb-3 grid shrink-0 grid-cols-3 gap-3">
            <TopStat label="Total Plant" value="3" />
            <TopStat label="Tank Active" value="7" />
            <TopStat label="RO Running" value="4" />
          </div>         

          <div
            className={`grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-3 ${modeClass.grid}`}
          >
            {sections.map((section) => (
              <div
                key={section.title}
                className="flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-[#dbe6f4] bg-[#f8fafc] shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
              >
                <div className="shrink-0 bg-gradient-to-r from-[#5a9bea] to-[#86b5ef] px-4 py-3 text-[16px] font-bold tracking-wide text-white md:text-[18px]">
                  {section.title}
                </div>

                <div
                  className={`flex min-h-0 flex-1 flex-col justify-between ${modeClass.content}`}
                >
                  <div className="flex flex-col gap-3">
                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${section.tanks.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {section.tanks.map((tank) => (
                        <div key={tank.name} className="min-w-0">
                          <div
                            className={`mb-1 text-center font-medium text-slate-600 ${modeClass.tankName}`}
                          >
                            {tank.name}
                          </div>
                          <Tank
                            level={tank.level}
                            color={tank.color}
                            tankHeight={modeClass.tankHeight}
                          />
                        </div>
                      ))}
                    </div>

                  <div
                    className={`grid ${
                      section.systems.length > 1 ? "grid-cols-1 gap-3" : "grid-cols-1"
                    }`}
                  >
                    {section.systems.map((system, index) => (
                      <div
                        key={index}
                        className="rounded-[16px] border border-slate-200 bg-white/90 p-3 shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div
                            className={`font-semibold text-slate-700 ${modeClass.cardTitle}`}
                          >
                            {system.name}
                          </div>
                          <div className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                            Active
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <div className="flex min-w-[58px] flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-[#d8e6f3] to-[#b7cfe9] px-2 py-3 text-center shadow-inner md:min-w-[70px]">
                            <div className="text-[10px] font-bold text-slate-700 md:text-[12px]">
                              {system.iconLabel}
                            </div>
                            <div className="mt-2 text-[20px] md:text-[24px]">💧</div>
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <InfoRow
                              label="TDS"
                              value={system.tds}
                              textClass={modeClass.text}
                              valueClass={modeClass.value}
                            />
                            <InfoRow
                              label="Flow Rate"
                              value={system.flow}
                              textClass={modeClass.text}
                              valueClass={modeClass.value}
                            />
                            <InfoRow
                              label="Total Output"
                              value={system.total}
                              textClass={modeClass.text}
                              valueClass={modeClass.value}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>{/* end flex-col gap-3 wrapper */}

                  <div className="grid grid-cols-1 gap-3">
                    {section.footerMetric && (
                      <div className="rounded-[14px] bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-white shadow-lg">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/80">
                          {section.footerMetric.label}
                        </div>
                        <div className={`font-bold ${modeClass.total}`}>
                          {section.footerMetric.value}
                        </div>
                      </div>
                    )}

                    {section.grandTotal && (
                      <div className="rounded-[14px] bg-gradient-to-r from-blue-500 to-sky-500 px-4 py-3 text-white shadow-lg">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/80">
                          Grand Total
                        </div>
                        <div className={`font-bold ${modeClass.total}`}>
                          {section.grandTotal}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-[20px] font-semibold text-slate-800 md:text-[24px]">
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value, textClass, valueClass }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
      <span className={`text-slate-500 ${textClass}`}>{label}</span>
      <span className={`font-semibold text-slate-800 ${valueClass}`}>{value}</span>
    </div>
  );
}

function Tank({ level, color, tankHeight }) {
  const colors = {
    cyan: "from-cyan-300 to-teal-500",
    blue: "from-blue-400 to-sky-500",
    orange: "from-orange-300 to-amber-500",
    yellow: "from-yellow-300 to-yellow-500",
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[18px] border border-slate-200 bg-gradient-to-b from-slate-100 to-slate-200 p-2 ${tankHeight}`}
    >
      <div className="relative h-full overflow-hidden rounded-[14px] border border-slate-200 bg-[#f6f7f9]">
        <div
          className={`absolute inset-x-[6px] bottom-[6px] rounded-b-[12px] bg-gradient-to-b ${colors[color]}`}
          style={{ height: `${level}%` }}
        >
          <div className="absolute inset-x-0 top-0 h-[6px] bg-white/35" />
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-1">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-[3px] w-4 rounded-full bg-white/90 md:w-5" />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-2 text-center text-[14px] font-bold text-white drop-shadow md:text-[16px]">
          {level}%
        </div>
      </div>
    </div>
  );
}