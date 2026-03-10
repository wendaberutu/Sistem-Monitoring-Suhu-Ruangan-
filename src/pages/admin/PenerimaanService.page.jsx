import { useEffect, useState } from "react";
import { createJob, getAllJobs, getTechnicians, getPenyetor, deleteJob } from "../../api/servicesJob.api";
import Layout from "../../layout/servicesLayout";
import { assignTechnician } from "../../api/servicesJob.api";
import QRCode from "qrcode";

export default function ServicesPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [technicians, setTechnicians] = useState([]);
  const [enableAssign, setEnableAssign] = useState(false);
  const [printData, setPrintData] = useState(null);
  const [penyetors, setPenyetors] = useState([]);
  const [penyetorSearch, setPenyetorSearch] = useState("");
  const [showPenyetorDropdown, setShowPenyetorDropdown] = useState(false);



  // ✅ Modal state
  const [showModal, setShowModal] = useState(false);

  // ✅ Form state
  const [formData, setFormData] = useState({
    customer_name: "",
    item_name: "",
    item_description: "",
    issue: "",
    technician_id: ""
  });

  // ✅ Modal assign state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");


  useEffect(() => {
    fetchJobs();
    fetchTechnicians();
    fetchPenyetor();
  }, []);

  const fetchPenyetor = async () => {
    try {
      const res = await getPenyetor();
      const data = res.data.data || res.data || [];
      setPenyetors(data);
    } catch (err) {
      console.error("Failed to fetch penyetor:", err);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await getTechnicians();
      console.log("TECHNICIANS API RESPONSE:", res); // Debug
      console.log("TECHNICIANS DATA:", res.data); // Debug

      // Handle berbagai format response
      const techData = res.data.data || res.data || [];
      console.log("TECHNICIANS PARSED:", techData); // Debug

      setTechnicians(techData);
    } catch (err) {
      console.error("Failed to fetch technicians:", err);
      alert("Gagal mengambil data teknisi: " + (err.response?.data?.message || err.message));
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const res = await createJob({
        nama_penyetor: formData.customer_name,
        item_name: formData.item_name,
        item_description: formData.item_description,
        reported_issue: formData.issue,
        technician_id: enableAssign && formData.technician_id
          ? Number(formData.technician_id)
          : null
      });

      const createdJob = res.data.data || res.data;

      const qrDataUrl = await QRCode.toDataURL(createdJob.qr_code_uid);

      const now = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      setPrintData({
        ...createdJob,
        qr: qrDataUrl,
        date: now
      });

      setTimeout(() => {
        window.print();
      }, 200);

      setShowModal(false);

      setFormData({
        customer_name: "",
        item_name: "",
        item_description: "",
        issue: "",
        technician_id: ""
      });

      setEnableAssign(false);

      fetchJobs();

    } catch (err) {
      alert("Gagal menambahkan service: " + (err.response?.data?.message || err.message));
    }
  };


  const handleDelete = async (job) => {
    if (!window.confirm("Hapus data service ini?")) return;

    try {
      await deleteJob(job.id);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal hapus data");
    }
  };

  const handlePrint = async (job) => {

    const qrDataUrl = await QRCode.toDataURL(job.qr_code_uid);

    const now = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    setPrintData({
      ...job,
      qr: qrDataUrl,
      date: now
    });

    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Filter jobs by search term
  const filteredJobs = jobs.filter((job) =>
    job.id?.toString().toLowerCase().includes(search.toLowerCase()) ||
    job.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    job.qr_code_uid?.toLowerCase().includes(search.toLowerCase()) ||
    job.technician_name?.toLowerCase().includes(search.toLowerCase()) ||
    job.status?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPenyetors = penyetors.filter((p) =>
    p.nama_pegawai.toLowerCase().includes(penyetorSearch.toLowerCase())
  );

  // Slice to show only requested entries per page
  const displayedJobs = filteredJobs.slice(0, entriesPerPage);



  const handleAssignClick = (job) => {
    setSelectedJob(job);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedTechnicianId) {
      alert("Pilih teknisi terlebih dahulu!");
      return;
    }

    try {
      await assignTechnician(selectedJob.id, selectedTechnicianId);
      alert("Teknisi berhasil di-assign!");
      setShowAssignModal(false);
      setSelectedJob(null);
      setSelectedTechnicianId("");
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal assign teknisi");
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Penerimaan Barang Servis</h1>

        <div className="mb-4 flex justify-between items-center gap-4">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-cyan-500/60 via-sky-500/15 to-blue-600/70 text-white px-4 py-2 rounded-md hover:opacity-90 transition">
            ADD Service
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
                            Not Assigned
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize
  ${job.status === "waiting" && "bg-amber-500/20 text-amber-300 border border-amber-500/30"}
  ${job.status === "assigned" && "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"}
  ${job.status === "in_progress" && "bg-sky-500/20 text-sky-300 border border-sky-500/30"}
  ${job.status === "pending_verification" && "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"}
  ${job.status === "pending_verifikasi_qc" && "bg-blue-500/20 text-blue-300 border border-blue-500/30"}
  ${job.status === "approved_maintenance" && "bg-purple-500/20 text-purple-300 border border-purple-500/30"}
  ${job.status === "in_sanitation" && "bg-teal-500/20 text-teal-300 border border-teal-500/30"}
  ${job.status === "rejected" && "bg-rose-500/20 text-rose-300 border border-rose-500/30"}
  ${job.status === "completed" && "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}
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
                            onClick={() => handleAssignClick(job)}
                            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700"
                          >
                            Assign
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


              <div className="relative">
                <label className="text-sm text-white">Nama Penyetor</label>

                <input
                  type="text"
                  placeholder="Cari penyetor..."
                  value={penyetorSearch}
                  onChange={(e) => {
                    setPenyetorSearch(e.target.value);
                    setShowPenyetorDropdown(true);
                  }}
                  onFocus={() => setShowPenyetorDropdown(true)}
                  className="w-full mt-1 px-3 py-2 rounded bg-slate-800 text-white border border-slate-600"
                />

                {showPenyetorDropdown && (
                  <div className="absolute z-50 w-full bg-slate-800 border border-slate-600 rounded mt-1 max-h-48 overflow-y-auto">

                    {filteredPenyetors.length === 0 && (
                      <div className="px-3 py-2 text-slate-400 text-sm">
                        Tidak ada data
                      </div>
                    )}

                    {filteredPenyetors.map((p) => (
                      <div
                        key={p.id_pegawai}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            customer_name: p.nama_pegawai
                          });

                          setPenyetorSearch(p.nama_pegawai);
                          setShowPenyetorDropdown(false);
                        }}
                        className="px-3 py-2 hover:bg-slate-700 cursor-pointer text-white"
                      >
                        {p.nama_pegawai}
                      </div>
                    ))}

                  </div>
                )}
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
                    <option key={tech.id_pegawai} value={tech.id_pegawai}>
                      {tech.nama_pegawai}
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

      {/* Modal Assign Teknisi */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 w-full max-w-md rounded-xl p-6 shadow-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">
              Assign Teknisi - Service ID {selectedJob?.id}
            </h2>

            <div className="mb-4">
              <p className="text-sm text-slate-300 mb-2">Item: <span className="font-semibold">{selectedJob?.item_name}</span></p>
              <p className="text-sm text-slate-300 mb-4">Teknisi saat ini: <span className="font-semibold">{selectedJob?.technician_name || "Belum dipilih"}</span></p>
            </div>

            <div className="mb-4">
              <label className="text-sm text-white block mb-2">Pilih Teknisi</label>
              <select
                value={selectedTechnicianId}
                onChange={(e) => setSelectedTechnicianId(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Teknisi --</option>
                {technicians.map((tech) => (
                  <option key={tech.id_pegawai} value={tech.id_pegawai}>
                    {tech.nama_pegawai}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedJob(null);
                  setSelectedTechnicianId("");
                }}
                className="px-4 py-2 rounded bg-slate-600 text-white hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleAssignSubmit}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="print-area">
        {printData && (

          <div className="print-container">

            <div className="uid">{printData.qr_code_uid}</div>

            <img className="qr" src={printData.qr} alt="QR Code Service" />

            <div className="service">ID: {printData.id}</div>

            <div className="info">

              <div className="line">Tanggal : {printData.date}</div>

              <div className="line">
                Nama Barang : {printData.item_name}
              </div>

              <div className="line">
                Penyetor : {printData.nama_penyetor || "-"}
              </div>

              <div className="line">
                Teknisi : {printData.technician_name || "Belum ditentukan"}
              </div>

              <div className="line">
                Issue : {printData.reported_issue || "-"}
              </div>

            </div>

          </div>

        )}
      </div>

      <style>{`

#print-area{
  display:none;
}

.print-container{
  width:240px;
  text-align:center;
  font-family:Arial;
  color:#000;
}

.uid{
  font-size:14px;
  font-weight:bold;
}

.service{
  font-size:13px;
  font-weight:bold;
  margin:4px 0;
}

.info{
  width:180px;
  margin:0 auto;
}

.line{
  font-size:12px;
  text-align:left;
  margin:2px 0;
}

@media print{

  body *{
    visibility:hidden;
  }

  #print-area, #print-area *{
    visibility:visible;
  }

  #print-area{
    display:block;
    position:absolute;
    left:0;
    top:0;
    width:100%;
  }

}

.qr{
  width:140px;
  margin:5px auto;
  display:block;
}

`}</style>
    </Layout>
  );
}

