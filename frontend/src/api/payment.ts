import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

function authHeaders() {
  const token = localStorage.getItem('token') || ''
  return { Authorization: `Bearer ${token}` }
}

export interface TopUpRecord {
  id: number
  user_id: number
  key: string
  status: number
  name: string
  quota: number
  created_time: number
  used_time?: number
}

export interface PayOrderResult {
  order_no?: string
  pay_url?: string
  pay_form?: string
  amount?: number
  quota?: number
}

export const paymentApi = {
  /**
   * 通过内置 epay 创建支付订单
   * new-api 管理后台需先配置支付宝商户参数
   */
  createPayOrder: (amount: number) =>
    api.post('/user/pay', { amount }, { headers: authHeaders() }),

  /**
   * 获取用户充值记录
   */
  getTopUpRecords: (page = 1, pageSize = 20) =>
    api.get('/user/topup/self', {
      headers: authHeaders(),
      params: { page, page_size: pageSize },
    }),

  /**
   * 获取充值信息（如是否开启在线支付等）
   */
  getTopUpInfo: () =>
    api.get('/user/topup/info', { headers: authHeaders() }),

  /**
   * 兑换码充值（已有功能，复用）
   */
  redeemCode: (key: string) =>
    api.post('/user/topup', { key }, { headers: authHeaders() }),
}
