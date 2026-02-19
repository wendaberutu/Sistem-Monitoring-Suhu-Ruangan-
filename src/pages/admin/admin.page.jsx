import Layout from "../../layout/servicesLayout";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Servis Masuk",
      subtitle: "Hari ini",
      value: 0,
      bg: "from-cyan-500/60 via-sky-500/15 to-blue-600/70",
      iconBg: "from-cyan-400 to-blue-500",
      icon: "👥",
    },
    {
      title: "Proses Pengerjaan",
      value: 11,
      bg: "from-amber-500/60 via-orange-500/15 to-yellow-600/70",
      iconBg: "from-amber-400 to-yellow-500",
      icon: "⚙️",
    },
    {
      title: "Servis Bisa Diambil",
      value: 0,
      bg: "from-emerald-500/60 via-green-500/15 to-emerald-600/70",
      iconBg: "from-emerald-400 to-green-500",
      icon: "🔖",
    },
    {
      title: "Servis Diambil",
      subtitle: "Hari ini",
      value: 0,
      bg: "from-rose-500/60 via-pink-500/15 to-red-600/70",
      iconBg: "from-rose-400 to-red-500",
      icon: "↗️",
    },
  ];

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-6 text-white">
        Dashboard Admin
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`
              rounded-xl p-4 flex items-center gap-4
              bg-gradient-to-br ${s.bg}
              border border-white/10
              shadow-lg shadow-black/30
            `}
          >
            {/* ICON */}
            <div
              className={`
                w-14 h-14 rounded-xl
                flex items-center justify-center
                text-white text-2xl
                bg-gradient-to-br ${s.iconBg}
                shadow-md
              `}
            >
              {s.icon}
            </div>

            {/* TEXT */}
            <div className="flex-1">
              <div className="text-sm text-slate-200">
                {s.title}{" "}
                {s.subtitle && (
                  <span className="font-semibold text-white">
                    {s.subtitle}
                  </span>
                )}
              </div>

              <div className="text-3xl font-bold text-white mt-1">
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
