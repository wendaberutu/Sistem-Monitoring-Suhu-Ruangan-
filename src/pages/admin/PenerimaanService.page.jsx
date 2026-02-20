import { useEffect, useState } from "react";
import { createJob, getAllJobs, getTechnicians } from "../../api/servicesJob.api";
import Layout from "../../layout/servicesLayout";

export default function ServicesPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [technicians, setTechnicians] = useState([]);
  const [enableAssign, setEnableAssign] = useState(false);

  // ✅ Modal state
  const [showModal, setShowModal] = useState(false);

  // ✅ Form state
  const [formData, setFormData] = useState({
    item_name: "",
    item_description: "",
    issue: "",
    technician_id: ""
  });


  useEffect(() => {
    fetchJobs();
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await getTechnicians();
      setTechnicians(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await getAllJobs();
      console.log("API RESPONSE:", res.data); // ← tambahkan ini
      setJobs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Submit create job
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createJob({
        item_name: formData.item_name,
        item_description: formData.item_description,
        issue: formData.issue,
        technician_id: formData.technician_id || null
      });

      setShowModal(false);
      setFormData({
        item_name: "",
        item_description: "",
        issue: "",
        technician_id: ""
      });

      fetchJobs();
    } catch (err) {
      console.error("Create job failed:", err);
    }
  };

  const handleEdit = (job) => {
    // Navigate to edit page or open edit modal (adjust route as needed)
    window.location.href = `/admin/penerimaan-service/edit/${job.id}`;
  };

  const handleDelete = (job) => {
    if (!window.confirm("Hapus data service ini?")) return;
    // Optimistic UI update — remove from local state
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
    console.log("Deleted job (optimistic):", job);
    // TODO: call delete API to persist removal
  };

  const handlePrint = (job) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<pre>${JSON.stringify(job, null, 2)}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter jobs by search term
  const filteredJobs = jobs.filter((job) =>
    job.id?.toString().toLowerCase().includes(search.toLowerCase()) ||
    job.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    job.qr_code_uid?.toLowerCase().includes(search.toLowerCase()) ||
    job.technician_name?.toLowerCase().includes(search.toLowerCase()) ||
    job.status?.toLowerCase().includes(search.toLowerCase())
  );

  // Slice to show only requested entries per page
  const displayedJobs = filteredJobs.slice(0, entriesPerPage);

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Penerimaan Barang Servis</h1>

        <div className="mb-4 flex justify-between items-center gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-cyan-500/60 via-sky-500/15 to-blue-600/70 text-white px-4 py-2 rounded-md hover:opacity-90 transition">
            Tambah Service
          </button>

          <div className="flex gap-4 items-center">
            {/* Show entries dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-white font-medium">Show entries:</label>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Search input */}
            <div>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded px-4 py-2 text-sm text-black w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">No</th>
                  <th className="px-6 py-3 text-left">ID Service</th>
                  <th className="px-6 py-3 text-left">QR Code</th>
                  <th className="px-6 py-3 text-left">Item Name</th>
                  <th className="px-6 py-3 text-left">Technician</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10 text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6">
                      Loading...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6">
                      No Data
                    </td>
                  </tr>
                ) : (
                  displayedJobs.map((job, index) => (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-800/60 transition"
                    >
                      <td className="px-6 py-4">{index + 1}</td>

                      <td className="px-6 py-4 font-medium">{job.id}</td>

                      <td className="px-6 py-4">{job.qr_code_uid}</td>

                      <td className="px-6 py-4">{job.item_name}</td>

                      <td className="px-6 py-4">
                        {job.technician_name || (
                          <span className="text-slate-400 italic">
                            Belum dipilih
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                           ${job.status === "completed" && "bg-emerald-500/20 text-emerald-300"}
                           ${job.status === "in_progress" && "bg-sky-500/20 text-sky-300"}
                           ${job.status === "waiting" && "bg-amber-500/20 text-amber-300"}
                           ${job.status === "assigned" && "bg-indigo-500/20 text-indigo-300"}
                           ${job.status === "rejected" && "bg-rose-500/20 text-rose-300"}
                           ${job.status === "pending_verification" && "bg-violet-500/20 text-violet-300"}
                         `}
                        >
                          {job.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePrint(job)}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                          >
                            Print
                          </button>

                          <button
                            onClick={() => handleEdit(job)}
                            className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(job)}
                            className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal tambah services */}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 w-full max-w-lg rounded-xl p-6 shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>

            <h2 className="text-xl font-bold mb-4 text-white">
              Tambah Service Baru
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">


              <div>
                <label className="text-sm text-white">Nama Penyetor </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-white">Item Name / Nama Barang</label>
                <input
                  type="text"
                  name="item_name"
                  value={formData.item_name}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-white">Item Description / kelengkapan Barang</label>
                <textarea
                  name="item_description"
                  value={formData.item_description}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-white">Issue / Kerusakan</label>
                <textarea
                  name="issue"
                  value={formData.issue}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-white block mb-2">
                  Teknisi yang Dipilih
                </label>

                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={enableAssign}
                    onChange={(e) => {
                      setEnableAssign(e.target.checked);
                      if (!e.target.checked) {
                        setFormData({ ...formData, technician_id: "" });
                      }
                    }}
                  />
                  <span className="text-red-400 text-sm">
                    Aktifkan Checklist untuk Pilih Teknisi
                  </span>
                </div>

                <select
                  disabled={!enableAssign}
                  name="technician_id"
                  value={formData.technician_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 disabled:opacity-50"
                >
                  <option value="">-- Pilih Teknisi --</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

