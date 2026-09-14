import axios, { type AxiosRequestConfig } from "axios";

// access the base URL from the environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// create a custom Axios instance with the base URL
export const AXIOS_INSTANCE = axios.create({
  baseURL: `${BASE_URL}`,
});

// create the final custom Axios instance that will be used in the generated API client
export const customInstance = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
  }).then(({ data }) => data);
  return promise;
};

export default customInstance;
