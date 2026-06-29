import 'server-only'
import axios, { AxiosInstance } from 'axios'
import { auth } from '@/auth'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'

export async function getServerAxiosClient(): Promise<AxiosInstance> {
  const session = await auth()
  const token = session?.user?.access_token ?? null
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: false,
  })
  return instance
}
