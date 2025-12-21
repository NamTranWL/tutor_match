import axios from 'axios';
import { getAccessToken, setAccessToken } from '../../stored/authToken';
import { auth } from "@/auth";
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
});

api.interceptors.request.use(async (config) => {
   let token = getAccessToken();
    if (!token) {
      const session = await auth();
      token = session?.user?.access_token ?? null;
      setAccessToken(token);
    }
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, unknown>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;
