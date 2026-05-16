<template>
  <div class="min-h-screen bg-dark">
    <AppHeader />
    <main class="max-w-5xl mx-auto px-6 py-12">
      <h1 class="text-3xl font-bold text-white text-center mb-10">简单透明的定价</h1>

      <!-- 套餐卡片 -->
      <div class="grid grid-cols-3 gap-6 mb-12">
        <div v-for="plan in plans" :key="plan.name" class="card p-8 relative" :class="{ 'border-primary': plan.popular }">
          <div v-if="plan.popular" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-4 py-1 rounded-full">
            最推荐
          </div>
          <h3 class="text-lg font-bold text-white mb-4">{{ plan.name }}</h3>
          <div class="mb-6">
            <span class="text-4xl font-bold text-white">${{ plan.price }}</span>
            <span class="text-text-dim text-sm">/月</span>
          </div>
          <div class="text-sm text-text-dim mb-2">· {{ plan.credits }} 积分/月</div>
          <div class="text-sm text-text-dim mb-8">· 约 ${{ plan.perImage }}/张</div>
          <RouterLink to="/register" class="btn-primary w-full block text-center" :class="plan.popular ? '' : 'btn-secondary'">
            开始使用
          </RouterLink>
        </div>
      </div>

      <!-- 充值码说明 -->
      <div class="card p-8 mb-8">
        <h3 class="text-lg font-bold text-white mb-4">离线充值</h3>
        <p class="text-sm text-text-dim mb-4">
          所有套餐均支持充值码方式。转账后联系客服获取充值码，在个人设置页输入充值码即可到账。
        </p>
        <div class="flex gap-3">
          <div class="flex-1 bg-card-light rounded-lg px-4 py-3">
            <p class="text-xs text-text-dim">充值码格式</p>
            <p class="text-sm text-white font-mono">XXXX-XXXX-XXXX-XXXX</p>
          </div>
          <div class="flex-1 bg-card-light rounded-lg px-4 py-3">
            <p class="text-xs text-text-dim">有效期</p>
            <p class="text-sm text-white">180 天</p>
          </div>
          <div class="flex-1 bg-card-light rounded-lg px-4 py-3">
            <p class="text-xs text-text-dim">积分单价</p>
            <p class="text-sm text-white">$0.05/积分</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="card p-8">
        <h3 class="text-lg font-bold text-white mb-6">常见问题</h3>
        <div class="space-y-4">
          <div v-for="faq in faqs" :key="faq.q" class="border-b border-white/5 pb-4 last:border-0">
            <p class="text-sm font-medium text-white mb-1">{{ faq.q }}</p>
            <p class="text-sm text-text-dim">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const plans = [
  { name: 'Starter', price: 9.9, credits: 200, perImage: '0.049', popular: false },
  { name: 'Pro', price: 29, credits: 600, perImage: '0.048', popular: true },
  { name: 'Enterprise', price: 99, credits: 2500, perImage: '0.040', popular: false }
]

const faqs = [
  { q: '积分用不完可以退款吗？', a: '积分一经购买不支持退款，请按需购买。' },
  { q: '充值码有效期多久？', a: '充值码有效期为 180 天，请在有效期内使用。' },
  { q: '生成图片可以商用吗？', a: '通过本平台生成的图片版权归生成者所有，可自由用于商业用途。' },
  { q: '有免费体验额度吗？', a: '新用户注册即送 10 积分，可免费体验基础功能。' }
]
</script>