import ApiJob from "./index.api.js";

/* ===============================
   GET ALL TECHNICIANS
================================= */
export const getTechnicians = () => {
  return ApiJob.get("/technicians");
};

/* ===============================
   GET ALL JOBS
================================= */
export const getAllJobs = () => {
  return ApiJob.get("/jobs");
};

/* ===============================
   GET Technician's JOBS
================================= */
export const getTechnicianJobs = () => {
  return ApiJob.get("/jobs/technician");
};
/* ===============================
   GET JOB DETAIL + HISTORY
================================= */
export const getJobById = (jobId) => {
  return ApiJob.get(`/jobs/${jobId}`);
};

/* ===============================
   GET JOB BY QR UID
================================= */
export const getJobByUID = (uid) => {
  return ApiJob.get(`/jobs/qr/${uid}`);
};

/* ===============================
   CREATE JOB (ADMIN)
================================= */
export const createJob = (payload) => {
  return ApiJob.post("/jobs", payload);
};

/* ===============================
   ASSIGN TECHNICIAN (ADMIN)
================================= */
export const assignTechnician = (jobId, technician_id) => {
  return ApiJob.patch(`/jobs/${jobId}/assign`, {
    technician_id,
  });
};

/* ===============================
   CLAIM JOB (TEKNISI)
================================= */
export const claimJob = (jobId) => {
  return ApiJob.patch(`/jobs/${jobId}/claim`);
};

/* ===============================
   SUBMIT JOB (TEKNISI)
================================= */
export const submitJob = (jobId, technician_action) => {
  return ApiJob.patch(`/jobs/${jobId}/submit`, {
    technician_action,
  });
};

/* ===============================
   VERIFY JOB (VERIFIER)
================================= */
export const verifyJob = (jobId, result, note = null) => {
  return ApiJob.patch(`/jobs/${jobId}/verify`, {
    result,   // "approved" / "rejected"
    note,
  });
};

/* ===============================
   COMPLETE JOB (ADMIN)
================================= */
export const completeJob = (jobId) => {
  return ApiJob.patch(`/jobs/${jobId}/complete`);
};
