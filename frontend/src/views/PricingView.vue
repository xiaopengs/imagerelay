<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center mb-12">
      <span class="section-tag">定价</span>
      <h1 class="text-3xl font-bold text-gray-800 mt-4">简单透明的定价</h1>
      <p class="text-gray-500 mt-2">按需购买，无隐藏费用，注册即送 10 积分</p>
    </div>

    <!-- 套餐卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div
        v-for="plan in plans"
        :key="plan.name"
        class="card-hover p-6 relative"
        :class="{ 'ring-2 ring-primary-500 shadow-glow': plan.popular }"
      >
        <div v-if="plan.popular" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs px-4 py-1 rounded-full font-medium">
          推荐
        </div>
        <h3 class="text-lg font-semibold text-gray-800">{{ plan.name }}</h3>
        <div class="mt-3 mb-4">
          <span class="text-3xl font-bold text-gray-800">&yen;{{ plan.price }}</span>
        </div>
        <ul class="text-sm text-gray-500 space-y-2 mb-6">
          <li>{{ plan.credits }} 积分</li>
          <li>约 &yen;{{ plan.perImage }}/张</li>
          <li>有效期 365 天</li>
        </ul>
        <RouterLink to="/register" :class="plan.popular ? 'btn-primary' : 'btn-secondary'" class="block text-center text-sm">
          开始使用
        </RouterLink>
      </div>
    </div>

    <!-- 充值码说明 -->
    <div class="card p-8 mb-8">
      <h3 class="text-lg font-bold text-gray-800 mb-4">离线充值</h3>
      <p class="text-sm text-gray-500 mb-4">
        所有套餐均支持充值码方式。转账后联系客服获取充值码，在个人设置页输入充值码即可到账。
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-gray-50 rounded-lg px-4 py-3">
          <p class="text-xs text-gray-400">充值码格式</p>
          <p class="text-sm text-gray-700 font-mono mt-1">XXXX-XXXX-XXXX-XXXX</p>
        </div>
        <div class="bg-gray-50 rounded-lg px-4 py-3">
          <p class="text-xs text-gray-400">有效期</p>
          <p class="text-sm text-gray-700 mt-1">180 天</p>
        </div>
        <div class="bg-gray-50 rounded-lg px-4 py-3">
          <p class="text-xs text-gray-400">积分单价</p>
          <p class="text-sm text-gray-700 mt-1">&yen;0.20~0.40/积分</p>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="card p-8">
      <h3 class="text-lg font-bold text-gray-800 mb-6">常见问题</h3>
      <div class="space-y-4">
        <div v-for="faq in faqs" :key="faq.q" class="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
          <p class="text-sm font-medium text-gray-700 mb-1">{{ faq.q }}</p>
          <p class="text-sm text-gray-500">{{ faq.a }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const plans = [
  { name: '体验包', price: '19.9', credits: 50, perImage: '0.40', popular: false },
  { name: '标准包', price: '49.9', credits: 150, perImage: '0.33', popular: true },
  { name: '专业包', price: '99.9', credits: 400, perImage: '0.25', popular: false },
  { name: '企业包', price: '299.9', credits: 1500, perImage: '0.20', popular: false },
]

const faqs = [
  { q: '积分用不完可以退款吗？', a: '积分一经购买不支持退款，请按需购买。积分有效期为 365 天。' },
  { q: '充值码有效期多久？', a: '充值码有效期为 180 天，请在有效期内使用。' },
  { q: '生成图片可以商用吗？', a: '通过本平台生成的图片版权归生成者所有，可自由用于商业用途。' },
  { q: '有免费体验额度吗？', a: '新用户注册即送 10 积分，可免费体验基础生图功能。' },
]
</script>
