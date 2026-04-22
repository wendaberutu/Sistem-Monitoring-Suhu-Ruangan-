import axios from "axios";

const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL_SERVICES,
  headers: { "Content-Type": "application/json" },
});

export const trackJobByUID = (uid) => publicApi.get(`/jobs/track/${uid}`);
