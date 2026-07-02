<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">充值中心</h1>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
        :class="activeTab === tab.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
      >{{ tab.label }}</button>
    </div>

    <!-- Tab 1: Balance Overview -->
    <div v-if="activeTab === 'balance'">
      <!-- Balance Card -->
      <div class="card p-8 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 mb-1">当前余额</p>
            <p class="text-4xl font-bold text-primary-600">{{ displayBalance }} <span class="text-base font-normal text-gray-400">积分</span></p>
            <p class="text-xs text-gray-400 mt-1">约可生成 {{ displayBalance }} 张图片</p>
          </div>
          <button @click="activeTab = 'recharge'" class="btn-primary">立即充值</button>
        </div>
      </div>

      <!-- Recent Consumption -->
      <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">最近消费</h3>
        <div v-if="recentLogs.length === 0" class="text-center py-8 text-gray-400 text-sm">
          暂无消费记录
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="log in recentLogs"
            :key="log.id"
            class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div>
              <p class="text-sm text-gray-700">{{ log.model_name || '图片生成' }}</p>
              <p class="text-xs text-gray-400">{{ formatTime(log.created_time) }}</p>
            </div>
            <span class="text-sm font-medium" :class="log.quota < 0 ? 'text-red-500' : 'text-green-500'">
              {{ log.quota < 0 ? '' : '+' }}{{ formatQuota(log.quota) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Recharge -->
    <div v-if="activeTab === 'recharge'">
      <!-- Plan Cards -->
      <h3 class="text-sm font-semibold text-gray-700 mb-4">选择充值套餐</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="card-hover p-5 cursor-pointer relative"
          :class="{ 'ring-2 ring-primary-500 shadow-glow': selectedPlan === plan.id }"
          @click="selectedPlan = selectedPlan === plan.id ? '' : plan.id"
        >
          <div v-if="plan.popular" class="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[10px] px-3 py-0.5 rounded-full font-medium">
            推荐
          </div>
          <h4 class="text-base font-semibold text-gray-800">{{ plan.name }}</h4>
          <div class="mt-2 mb-3">
            <span class="text-2xl font-bold text-gray-800">&yen;{{ plan.price }}</span>
          </div>
          <p class="text-sm text-primary-600 font-medium">{{ plan.credits }} 积分</p>
          <p class="text-xs text-gray-400 mt-1">约 {{ plan.credits }} 张图片</p>
          <p class="text-xs text-gray-400">&yen;{{ plan.perImage }}/张</p>
        </div>
      </div>

      <!-- Pay Button -->
      <div v-if="selectedPlan" class="card p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm text-gray-500">已选套餐</p>
            <p class="text-lg font-semibold text-gray-800">{{ selectedPlanData?.name }} — &yen;{{ selectedPlanData?.price }}</p>
          </div>
          <p class="text-2xl font-bold text-primary-600">{{ selectedPlanData?.credits }} <span class="text-sm font-normal text-gray-400">积分</span></p>
        </div>
        <button
          @click="handlePay"
          class="btn-primary w-full py-3 text-base"
          :disabled="paying"
        >
          <span v-if="paying">处理中...</span>
          <span v-else>支付宝支付 &yen;{{ selectedPlanData?.price }}</span>
        </button>
        <p v-if="payError" class="text-sm text-red-500 mt-3 text-center">{{ payError }}</p>
        <p class="text-xs text-gray-400 mt-3 text-center">支付完成后积分将自动到账，刷新页面查看余额</p>
      </div>

      <!-- Redemption Code -->
      <div class="card p-6">
        <h3 class="text-sm font-semibold text-gray-700 mb-4">兑换码充值</h3>
        <div class="flex gap-3">
          <input
            v-model="redeemKey"
            class="input-field flex-1"
            placeholder="输入兑换码..."
          />
          <button @click="handleRedeem" class="btn-secondary whitespace-nowrap" :disabled="redeeming">
            {{ redeeming ? '兑换中...' : '兑换' }}
          </button>
        </div>
        <p v-if="redeemMsg" class="text-sm mt-2" :class="redeemSuccess ? 'text-green-600' : 'text-red-500'">{{ redeemMsg }}</p>
      </div>
    </div>

    <!-- Tab 3: Order History -->
    <div v-if="activeTab === 'orders'">
      <div class="card overflow-hidden">
        <div v-if="orders.length === 0 && !ordersLoading" class="text-center py-12 text-gray-400 text-sm">
          暂无充值记录
        </div>
        <div v-else>
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-5 py-3 text-gray-500 font-medium">时间</th>
                <th class="text-left px-5 py-3 text-gray-500 font-medium">类型</th>
                <th class="text-left px-5 py-3 text-gray-500 font-medium">名称</th>
                <th class="text-right px-5 py-3 text-gray-500 font-medium">积分</th>
                <th class="text-right px-5 py-3 text-gray-500 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in orders"
                :key="order.id"
                class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td class="px-5 py-3 text-gray-600">{{ formatTime(order.created_time) }}</td>
                <td class="px-5 py-3 text-gray-600">{{ order.key ? '兑换码' : '在线支付' }}</td>
                <td class="px-5 py-3 text-gray-700">{{ order.name || '-' }}</td>
                <td class="px-5 py-3 text-right font-medium text-primary-600">+{{ formatQuota(order.quota) }}</td>
                <td class="px-5 py-3 text-right">
                  <span class="text-xs px-2 py-0.5 rounded-full" :class="orderStatusClass(order.status)">
                    {{ orderStatusText(order.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- Pagination -->
          <div v-if="ordersTotal > ordersPageSize" class="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p class="text-xs text-gray-400">共 {{ ordersTotal }} 条记录</p>
            <div class="flex gap-1">
              <button
                @click="ordersPage > 1 && (ordersPage--, fetchOrders())"
                class="px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                :disabled="ordersPage <= 1"
              >上一页</button>
              <button
                @click="ordersPage * ordersPageSize < ordersTotal && (ordersPage++, fetchOrders())"
                class="px-3 py-1 text-xs rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                :disabled="ordersPage * ordersPageSize >= ordersTotal"
              >下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/user'
import { paymentApi } from '@/api/payment'

const auth = useAuthStore()

const tabs = [
  { key: 'balance', label: '余额概览' },
  { key: 'recharge', label: '充值' },
  { key: 'orders', label: '订单记录' },
]
const activeTab = ref('balance')

// --- Balance Overview ---
const displayBalance = computed(() => {
  const q = auth.balance
  return (q / 500000).toFixed(1)
})

interface LogItem {
  id: number
  model_name?: string
  quota: number
  created_time: number
}

const recentLogs = ref<LogItem[]>([])

async function fetchRecentLogs() {
  try {
    const res = await userApi.getLogs(1)
    const logs = res.data?.data || res.data || []
    recentLogs.value = (Array.isArray(logs) ? logs : []).slice(0, 8)
  } catch (e) {
    console.warn('Failed to fetch logs:', e)
  }
}

// --- Recharge ---
const plans = [
  { id: 'starter', name: '体验包', price: '19.9', credits: 50, perImage: '0.40', popular: false },
  { id: 'standard', name: '标准包', price: '49.9', credits: 150, perImage: '0.33', popular: true },
  { id: 'pro', name: '专业包', price: '99.9', credits: 400, perImage: '0.25', popular: false },
  { id: 'enterprise', name: '企业包', price: '299.9', credits: 1500, perImage: '0.20', popular: false },
]

const selectedPlan = ref('')
const paying = ref(false)
const payError = ref('')

const selectedPlanData = computed(() => plans.find(p => p.id === selectedPlan.value))

async function handlePay() {
  if (!selectedPlanData.value) return
  paying.value = true
  payError.value = ''
  try {
    const res = await paymentApi.createPayOrder(Number(selectedPlanData.value.price))
    const data = res.data
    // new-api 可能返回 pay_url 或 pay_form
    if (data?.pay_url) {
      window.open(data.pay_url, '_blank')
    } else if (data?.pay_form) {
      // pay_form 是 HTML form 字符串，需要 document.write 提交
      const div = document.createElement('div')
      div.innerHTML = data.pay_form
      document.body.appendChild(div)
      const form = div.querySelector('form')
      if (form) form.submit()
    } else {
      payError.value = '支付服务暂未开通，请使用兑换码充值'
    }
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || '支付请求失败'
    payError.value = msg.includes('epay') || msg.includes('not') ?
      '在线支付暂未开通，请使用兑换码充值' : msg
  } finally {
    paying.value = false
  }
}

// Redemption code
const redeemKey = ref('')
const redeeming = ref(false)
const redeemMsg = ref('')
const redeemSuccess = ref(false)

async function handleRedeem() {
  if (!redeemKey.value.trim()) {
    redeemMsg.value = '请输入兑换码'
    redeemSuccess.value = false
    return
  }
  redeeming.value = true
  redeemMsg.value = ''
  redeemSuccess.value = false
  try {
    await paymentApi.redeemCode(redeemKey.value.trim())
    redeemMsg.value = '兑换成功！积分已到账'
    redeemSuccess.value = true
    redeemKey.value = ''
    // Refresh balance
    await auth.fetchUser()
    fetchOrders()
  } catch (e: any) {
    redeemMsg.value = e?.response?.data?.message || '兑换失败，请检查兑换码'
    redeemSuccess.value = false
  } finally {
    redeeming.value = false
  }
}

// --- Order History ---
const orders = ref<any[]>([])
const ordersPage = ref(1)
const ordersPageSize = 10
const ordersTotal = ref(0)
const ordersLoading = ref(false)

async function fetchOrders() {
  ordersLoading.value = true
  try {
    const res = await paymentApi.getTopUpRecords(ordersPage.value, ordersPageSize)
    const data = res.data
    orders.value = data?.data || data || []
    ordersTotal.value = data?.total || orders.value.length || 0
  } catch (e) {
    console.warn('Failed to fetch orders:', e)
    orders.value = []
  } finally {
    ordersLoading.value = false
  }
}

// --- Helpers ---
function formatQuota(quota: number) {
  return (Math.abs(quota) / 500000).toFixed(1)
}

function formatTime(ts: number) {
  if (!ts) return '-'
  const d = new Date(ts * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function orderStatusText(status: number) {
  const map: Record<number, string> = { 1: '已完成', 2: '已使用', 3: '已过期' }
  return map[status] || '待处理'
}

function orderStatusClass(status: number) {
  const map: Record<number, string> = {
    1: 'bg-green-50 text-green-600',
    2: 'bg-blue-50 text-blue-600',
    3: 'bg-gray-100 text-gray-500',
  }
  return map[status] || 'bg-yellow-50 text-yellow-600'
}

// Fetch data on tab change
watch(activeTab, (tab) => {
  if (tab === 'balance') fetchRecentLogs()
  if (tab === 'orders') fetchOrders()
})

onMounted(() => {
  fetchRecentLogs()
  // Refresh user balance
  auth.fetchUser()
})
</script>
