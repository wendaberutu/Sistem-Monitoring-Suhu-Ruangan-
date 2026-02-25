import { useState } from "react";
import Layout from "../../layout/servicesLayout";

export default function TechnicianDashboard() {
  const [jobs] = useState([
    {
      id: "SRV-20260225-0004",
      title: "AC Panasonic",
      issue: "Tidak dingin",
      status: "waiting",
    },
    {
      id: "SRV-20260200-0012",
      title: "Kulkas LG",
      issue: "Tidak dingin",
      status: "waiting",
    },
    {
      id: "SRV-20260201-0006",
      title: "Laptop HP",
      issue: "Tidak bisa nyala",
      status: "waiting",
    },
  ]);

  const [myJobs] = useState([
    {
      id: "SRV-20260225-0002",
      title: "Kipas Angin",
      action: "",
      status: "in_progress",
    },
    {
      id: "SRV-20260215-0003",
      title: "Laptop ASUS",
      action: "Ganti thermal paste, cek kipas pendingin.",
      status: "pending",
    },
  ]);

  const StatusBadge = ({ status }) => {
    const map = {
      waiting: "bg-yellow-500/20 text-yellow-400",
      in_progress: "bg-blue-500/20 text-blue-400",
      pending: "bg-purple-500/20 text-purple-400",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
        {status === "waiting"
          ? "Waiting"
          : status === "in_progress"
          ? "In Progress"
          : "Pending Verification"}
      </span>
    );
  };

  return (
    <Layout>
      <div className="p-8 text-white">

        <h1 className="text-2xl font-bold mb-8">Dashboard Teknisi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* JOB TERSEDIA */}
          <div>
            <h2 className="text-lg font-semibold mb-6 border-b border-gray-700 pb-2">
              Job Tersedia
            </h2>

            <div className="space-y-5">
              {jobs.map((job, i) => (
                <div
                  key={i}
                  className="bg-[#1a2235] border border-gray-700 rounded-xl p-5"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <StatusBadge status={job.status} />
                  </div>

                  <p className="text-sm text-gray-400">ID: {job.id}</p>
                  <p className="text-sm text-blue-400 mb-4">
                    Issue: {job.issue}
                  </p>

                  <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-sm font-semibold transition">
                    Claim Job
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* JOB SAYA */}
          <div>
            <h2 className="text-lg font-semibold mb-6 border-b border-gray-700 pb-2">
              Job Saya
            </h2>

            <div className="space-y-5">
              {myJobs.map((job, i) => (
                <div
                  key={i}
                  className="bg-[#1a2235] border border-gray-700 rounded-xl p-5"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <StatusBadge status={job.status} />
                  </div>

                  <p className="text-sm text-gray-400 mb-3">ID: {job.id}</p>

                  <textarea
                    className="w-full bg-[#0f172a] border border-gray-600 rounded-lg p-3 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Tindakan teknisi..."
                    defaultValue={job.action}
                  />

                  <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-semibold transition">
                    Submit
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}