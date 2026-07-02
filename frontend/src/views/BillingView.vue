<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">充值中心</h1>

    <div class="flex gap-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
      <button class="px-4 py-1.5 text-sm font-medium bg-white text-primary-600 rounded-md shadow-sm">余额概览</button>
      <button class="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md transition-colors">充值</button>
      <button class="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md transition-colors">订单记录</button>
    </div>

    <div class="card p-8 text-center">
      <p class="text-sm text-gray-500 mb-2">当前余额</p>
      <p class="text-4xl font-bold text-primary-600">0 积分</p>
      <button class="btn-primary mt-6">立即充值</button>
    </div>
  </div>
</template>
