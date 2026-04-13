import { useEffect, useState } from "react";
import {
  createJob,
  getAllJobs,
  updateJob,
  getPenyetor,
  getAssetByKodeUnit,
} from "../../api/servicesJob.api";
import Layout from "../../layout/servicesLayout";
import QRCode from "qrcode";
import { usePrinter } from "../../hooks/usePrinter";
import PrinterSelectModal from "../../components/PrinterSelectModal";

export default function ServicesPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [printData, setPrintData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    item_name: "",
    item_description: "",
    issue: "",
    customer_name: "",
  });
  const [penyetors, setPenyetors] = useState([]);
  const [penyetorSearch, setPenyetorSearch] = useState("");
  const [showPenyetorDropdown, setShowPenyetorDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [assetStatus, setAssetStatus] = useState(null);

  const {
    printer,
    printing,
    printError,
    showModal: showPrinterModal,
    setShowModal: setShowPrinterModal,
    selectPrinter,
    forgetPrinter,
    printJob,
  } = usePrinter();

  const [formData, setFormData] = useState({
    kode_unit: "",
    item_name: "",
    item_description: "",
    issue: "",
    technician_id: "",
    customer_name: "",
  });

  useEffect(() => {
    fetchJobs();
    fetchPenyetor();
  }, []);

  const fetchPenyetor = async () => {
    try {
      const res = await getPenyetor();
      setPenyetors(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch penyetor:", err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await getAllJobs();
      setJobs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleKodeUnitBlur = async (e) => {
    const kode = e.target.value.trim();

    if (!kode) {
      setAssetStatus(null);
      return;
    }

    setAssetStatus("loading");

    try {
      const res = await getAssetByKodeUnit(kode);
      setFormData((prev) => ({
        ...prev,
        item_name: res.data.data.item_name,
      }));
      setAssetStatus("found");
    } catch {
      setAssetStatus("not_found");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await createJob({
        kode_unit: formData.kode_unit || undefined,
        item_name: formData.item_name,
        item_description: formData.item_description,
        reported_issue: formData.issue,
        nama_penyetor: formData.customer_name,
        technician_id: null,
      });

      const createdJob = res.data.data;
      const qrDataUrl = await QRCode.toDataURL(createdJob.qr_code_uid);

      const now = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const jobForPrint = {
        ...createdJob,
        nama_penyetor: createdJob.nama_penyetor || formData.customer_name,
        qr: qrDataUrl,
        date: now,
      };

      setPrintData(jobForPrint);
      await printJob(jobForPrint);

      setShowModal(false);
      setFormData({
        kode_unit: "",
        item_name: "",
        item_description: "",
        issue: "",
        technician_id: "",
        customer_name: "",
      });
      setPenyetorSearch("");
      setAssetStatus(null);
      setShowPenyetorDropdown(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (job) => {
    setEditData({
      id: job.id,
      item_name: job.item_name,
      item_description: job.item_description || "",
      issue: job.reported_issue || "",
      customer_name: job.nama_penyetor || "",
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateJob(editData.id, {
        item_name: editData.item_name,
        item_description: editData.item_description,
        reported_issue: editData.issue,
        nama_penyetor: editData.customer_name,
      });

      setShowEditModal(false);
      fetchJobs();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handlePrint = async (job) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(job.qr_code_uid);
      const now = new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const jobForPrint = {
        ...job,
        qr: qrDataUrl,
        date: now,
      };

      setPrintData(jobForPrint);
      await printJob(jobForPrint);
    } catch (err) {
      console.error("Print error:", err);
    }
  };

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

  const displayedJobs = filteredJobs.slice(0, entriesPerPage);

  const getStatusClass = (status) => {
    if (status === "completed") return "bg-emerald-500/20 text-emerald-300";
    if (status === "in_progress") return "bg-sky-500/20 text-sky-300";
    if (status === "waiting") return "bg-amber-500/20 text-amber-300";
    if (status === "assigned") return "bg-indigo-500/20 text-indigo-300";
    if (status === "rejected") return "bg-rose-500/20 text-rose-300";
    if (status === "pending_verification") return "bg-violet-500/20 text-violet-300";
    return "bg-slate-500/20 text-slate-300";
  };

  return (
    <Layout>
      <div className="px-3 py-4 sm:px-0 sm:py-0">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
          Penerimaan Barang Servis
        </h1>

        <div className="mb-4 flex flex-col gap-2 text-xs sm:text-sm">
          {printer ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-emerald-400 break-all">
                &#9679; Printer: {printer.name || printer.address}
              </span>
              <button
                onClick={forgetPrinter}
                className="text-slate-400 hover:text-rose-400 underline"
              >
                Ganti
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPrinterModal(true)}
              className="text-yellow-400 hover:text-yellow-300 underline text-left w-fit"
            >
              &#9675; Pilih Printer Bluetooth
            </button>
          )}

          {printing && (
            <span className="text-blue-400 animate-pulse">Mencetak...</span>
          )}

          {printError && (
            <span className="text-rose-400 break-words">{printError}</span>
          )}
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-cyan-500/60 via-sky-500/15 to-blue-600/70 text-white px-4 py-2.5 rounded-md hover:opacity-90 transition w-full sm:w-auto"
          >
            Tambah Service
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-sm text-white font-medium whitespace-nowrap">
                Show:
              </label>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-2 sm:py-1.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 sm:py-1.5 text-sm text-black flex-1 min-w-0 sm:w-[220px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="md:hidden bg-slate-900/40 border border-white/10 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-200">Daftar Service</h2>
            <span className="text-xs text-slate-400">{displayedJobs.length} item</span>
          </div>

          <div className="max-h-[65vh] overflow-y-auto pr-1 pb-4 space-y-3">
            {loading ? (
              <div className="bg-slate-900/70 backdrop-blur-md shadow-xl rounded-2xl border border-white/10 p-4 text-center text-slate-300">
                Loading...
              </div>
            ) : displayedJobs.length === 0 ? (
              <div className="bg-slate-900/70 backdrop-blur-md shadow-xl rounded-2xl border border-white/10 p-4 text-center text-slate-300">
                No Data
              </div>
            ) : (
              displayedJobs.map((job, index) => (
                <div
                  key={job.id}
                  className="bg-slate-900/70 backdrop-blur-md shadow-xl rounded-2xl border border-white/10 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400">No. {index + 1}</p>
                      <h3 className="text-base font-semibold text-white break-words leading-snug mt-1">
                        {job.item_name}
                      </h3>
                      <p className="text-xs text-slate-400 break-all mt-1">
                        {job.id}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize whitespace-nowrap ${getStatusClass(
                        job.status
                      )}`}
                    >
                      {job.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-slate-400 text-xs">QR Code</p>
                      <p className="text-slate-200 break-all">{job.qr_code_uid}</p>
                    </div>

                    <div>
                      <p className="text-slate-400 text-xs">Technician</p>
                      <p className="text-slate-200 break-words">
                        {job.technician_name || (
                          <span className="text-slate-400 italic">Not Assigned</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => handlePrint(job)}
                      className="text-sm bg-blue-600 text-white px-3 py-2.5 rounded-md hover:bg-blue-700"
                    >
                      Print
                    </button>

                    <button
                      onClick={() => handleEdit(job)}
                      className="text-sm bg-yellow-500 text-white px-3 py-2.5 rounded-md hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="hidden md:block bg-slate-900/70 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white/10">
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
                    <tr key={job.id} className="hover:bg-slate-800/60 transition">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4 font-medium">{job.id}</td>
                      <td className="px-6 py-4">{job.qr_code_uid}</td>
                      <td className="px-6 py-4">{job.item_name}</td>
                      <td className="px-6 py-4">
                        {job.technician_name || (
                          <span className="text-slate-400 italic">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusClass(
                            job.status
                          )}`}
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

      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => {
            setShowModal(false);
            setShowPenyetorDropdown(false);
          }}
        >
          <div
            className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-xl p-4 md:p-6 shadow-2xl border border-white/10 max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
                    setFormData((prev) => ({
                      ...prev,
                      customer_name: e.target.value,
                    }));
                  }}
                  onFocus={() => setShowPenyetorDropdown(true)}
                  className="w-full mt-1 px-3 py-2.5 rounded bg-slate-800 text-white border border-slate-600"
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
                          setFormData((prev) => ({
                            ...prev,
                            customer_name: p.nama_pegawai,
                          }));
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
                <label className="text-sm text-white">
                  Kode Unit Aset <span className="text-slate-400">(opsional)</span>
                </label>
                <input
                  type="text"
                  name="kode_unit"
                  value={formData.kode_unit}
                  onChange={handleChange}
                  onBlur={handleKodeUnitBlur}
                  placeholder="Kosongkan jika bukan dari aset"
                  className="w-full mt-1 px-3 py-2.5 rounded bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
                {assetStatus === "loading" && (
                  <p className="text-xs text-slate-400 mt-1">Mencari aset...</p>
                )}
                {assetStatus === "found" && (
                  <p className="text-xs text-emerald-400 mt-1">
                    Aset ditemukan — nama barang terisi otomatis
                  </p>
                )}
                {assetStatus === "not_found" && (
                  <p className="text-xs text-rose-400 mt-1">
                    Kode unit tidak ditemukan — isi nama barang manual
                  </p>
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
                  className="w-full mt-1 px-3 py-2.5 rounded bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-white">
                  Item Description / kelengkapan Barang
                </label>
                <textarea
                  name="item_description"
                  value={formData.item_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full mt-1 px-3 py-2.5 rounded bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm text-white">Issue / Kerusakan</label>
                <textarea
                  name="issue"
                  value={formData.issue}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full mt-1 px-3 py-2.5 rounded bg-slate-800 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sticky bottom-0 bg-slate-900 pt-3 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setShowPenyetorDropdown(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded bg-slate-600 text-white hover:bg-slate-700"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-xl p-4 md:p-6 shadow-2xl border border-white/10 max-h-[88vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-white">Edit Service</h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm text-white">Nama Penyetor</label>
                <input
                  type="text"
                  name="customer_name"
                  value={editData.customer_name}
                  onChange={handleEditChange}
                  className="w-full mt-1 px-3 py-2.5 rounded bg-slate-800 text-white border border-slate-600"
                />
              </div>

              <div>
                <label className="text-sm text-white">Nama Barang</label>
                <input
                  type="text"
                  name="item_name"
                  value={editData.item_name}
                  onChange={handleEditChange}
                  className="w-full mt-1 px-3 py-2.5 rounded bg-slate-800 text-white border border-slate-600"
                />
              </div>

              <div>
                <label className="text-sm text-white">Deskripsi</label>
                <textarea
                  name="item_description"
                  value={editData.item_description}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full mt-1 px-3 py-2.5 rounded bg-slate-800 text-white border border-slate-600"
                />
              </div>

              <div>
                <label className="text-sm text-white">Issue</label>
                <textarea
                  name="issue"
                  value={editData.issue}
                  onChange={handleEditChange}
                  rows={4}
                  className="w-full mt-1 px-3 py-2.5 rounded bg-slate-800 text-white border border-slate-600"
                />
              </div>

              <div className="sticky bottom-0 bg-slate-900 pt-3 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded bg-slate-600 text-white"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 rounded bg-blue-600 text-white"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrinterModal && (
        <PrinterSelectModal
          onSelect={selectPrinter}
          onClose={() => setShowPrinterModal(false)}
        />
      )}

      <div id="print-area">
        {printData && (
          <div className="print-container">
            <div className="uid">{printData.qr_code_uid}</div>
            <img className="qr" src={printData.qr} alt="QR Code Service" />
            <div className="service">ID: {printData.id}</div>

            <div className="info">
              <div className="line">Tanggal {printData.date}</div>
              <div className="line">Nama Barang : {printData.item_name}</div>
              <div className="line">Penyetor : {printData.nama_penyetor || "-"}</div>
              <div className="line">Issue : {printData.reported_issue}</div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        #print-area{
          display:none;
        }

        .print-container{
          width:80mm;
          padding:4mm;
          text-align:center;
          font-family:Arial;
          color:#000;
          box-sizing:border-box;
        }

        .uid{
          font-size:12px;
          font-weight:bold;
          margin-bottom:4px;
        }

        .qr{
          width:140px;
          margin:4px auto;
        }

        .service{
          font-size:12px;
          font-weight:bold;
          margin-top:4px;
        }

        .info{
          width:100%;
        }

        .line{
          font-size:11px;
          text-align:left;
          margin:2px 0;
        }

        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body *{
            visibility:hidden;
          }

          #print-area, #print-area *{
            visibility:visible;
          }

          #print-area{
            display:block;
            position:fixed;
            left:0;
            top:0;
            width:80mm;
          }
        }
      `}</style>
    </Layout>
  );
}