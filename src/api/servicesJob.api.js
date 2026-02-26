import ApiJob from "./index.api.js";

/* ===============================
   GET ALL TECHNICIANS
================================= */
export const getTechnicians = () => {
  return ApiJob.get("/jobs/technicians");
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
   GET AVAILABLE JOBS (TEKNISI)
================================= */
export const getAvailableJobs = () => {
  return ApiJob.get("/jobs/available");
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
export const verifyJob = (jobId, status, note = null) => {
  return ApiJob.patch(`/jobs/${jobId}/verify`, {
    status,   // ✅ HARUS status
    note,
  });
};

/* ===============================
   COMPLETE JOB (ADMIN)
================================= */
export const completeJob = (jobId) => {
  return ApiJob.patch(`/jobs/${jobId}/complete`);
};

/* ===============================
   DELETE JOB (ADMIN)F
================================= */
export const deleteJob = (jobId) => {
  return ApiJob.delete(`/jobs/${jobId}`);
};
/* ===============================
   GET MY JOBS (TEKNISI)
================================= */
export const getMyJobs = () => {
  return ApiJob.get("/jobs/my-jobs");
};

/* ===============================
   GET MY JOBS (VERIFIER)
================================= */
export const getPendingVerification = () => {
  return ApiJob.get("/jobs/pending-verification");
};