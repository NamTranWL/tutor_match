import type { ApiResponse } from '@/shared/types/api/common'
import type { AdminOverview } from '@/shared/types/api/adminDashboard'
import { getServerAxiosClient } from './serverAxios'

const base = '/admin/dashboard'

export async function getAdminOverview(): Promise<AdminOverview> {
  const axios = await getServerAxiosClient()
  const res = await axios.get<ApiResponse<AdminOverview>>(`${base}/overview`)
  return res.data.data
}
