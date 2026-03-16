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

export const updateJob = (id, data) => {
  return ApiJob.put(`/jobs/${id}`, data);
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

export const claimJobByQR = (uid) => {
  return ApiJob.patch(`/jobs/claim-qr`, {
    qr_code_uid: uid
  });
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

/* ===============================
   START SANITATION (SANITASI)
================================= */

/* ===============================
   FINISH SANITATION (SANITASI)
================================= */
export const finishSanitation = (uid) => {
  return ApiJob.patch(`/jobs/finish-sanitasi`, {
    qr_code_uid: uid
  });
};

export const getJobInSanitation = () => {
  return ApiJob.get("/jobs/sanitation-in-progress");
};  

/* ===============================
   SCAN QR QC
================================= */
export const scanQcJob = (qrUid) => {
  return ApiJob.get(`/jobs/qr/${qrUid}`);
};

/* ===============================
   VERIFY QC
================================= */
export const verifyQcJob = (data) => {
  return ApiJob.patch("/jobs/qc-verify", data);
};;

export const getPenyetor = () => {
  return ApiJob.get("/jobs/penyetor");
};