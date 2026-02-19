import { useEffect, useState } from "react";
import { getAllJobs } from "../../api/servicesJob.api";
import Layout from "../../layout/servicesLayout";

export default function ServicesPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await getAllJobs();
      console.log("API RESPONSE:", res.data);   // ← tambahkan ini
      setJobs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
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

  return (
    <Layout>
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Penerimaan Barang Servis
      </h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
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

            <tbody className="divide-y">
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
                jobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {job.id}
                    </td>

                    <td className="px-6 py-4">
                      {job.qr_code_uid}
                    </td>

                    <td className="px-6 py-4">
                      {job.item_name}
                    </td>

                    <td className="px-6 py-4">
                      {job.technician_name || (
                        <span className="text-gray-400">
                          Belum dipilih
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 capitalize">
                      {job.status}
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
    </Layout>
  );
}
