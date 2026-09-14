import axios from "axios";

// access the base URL from the environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// create an axios instance with the base URL and default headers
export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});
