import ApiJob from './index.api.js';

/* ===============================
   GET ALL JOBS
================================= */
export const getAllJobs = () => {
  return ApiJob.get("/jobs");
};

/* ===============================
   CREATE JOB (ADMIN)
================================= */
export const createJob = (payload) => {
  return ApiJob.post("/jobs", payload);
};

/* ===============================
   CLAIM JOB (TEKNISI)
================================= */
export const claimJob = (jobId) => {
  return ApiJob.patch(`/jobs/${jobId}/claim`);
};

/* ===============================
   SUBMIT JOB
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
    status,
    note,
  });
};

/* ===============================
   COMPLETE JOB (ADMIN)
================================= */
export const completeJob = (jobId) => {
  return ApiJob.patch(`/jobs/${jobId}/complete`);
};


