<template>
  <div class="min-h-screen bg-dark">
    <AppHeader />
    <main class="max-w-5xl mx-auto px-6 py-12">
      <h1 class="text-3xl font-bold text-white mb-10">开发者 API</h1>

      <!-- 快速开始 -->
      <div class="card p-8 mb-8">
        <h3 class="text-lg font-bold text-white mb-4">快速开始</h3>
        <p class="text-sm text-text-dim mb-4">
          ImageRelay 提供 OpenAI 兼容格式的 API 接口。获取 API Token 后即可通过标准 HTTP 请求调用。
        </p>
        <div class="bg-card-light rounded-lg px-4 py-3">
          <p class="text-xs text-text-dim mb-1">API 地址</p>
          <p class="text-sm text-white font-mono break-all">https://your-domain.com/v1/images/generations</p>
        </div>
      </div>

      <!-- 接口表格 -->
      <div class="card p-8 mb-8">
        <h3 class="text-lg font-bold text-white mb-6">API 端点</h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-text-dim border-b border-white/10">
              <th class="text-left pb-3 font-medium">接口</th>
              <th class="text-left pb-3 font-medium">说明</th>
            </tr>
          </thead>
          <tbody class="text-text-dim">
            <tr v-for="ep in endpoints" :key="ep.path" class="border-b border-white/5">
              <td class="py-3 font-mono text-primary">{{ ep.path }}</td>
              <td class="py-3">{{ ep.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 代码示例 -->
      <div class="card p-8 mb-8">
        <h3 class="text-lg font-bold text-white mb-6">代码示例</h3>
        <div class="flex gap-2 mb-4">
          <button
            v-for="lang in ['cURL', 'JavaScript', 'Python']"
            :key="lang"
            @click="activeLang = lang"
            class="px-4 py-1.5 rounded-lg text-sm transition-colors"
            :class="activeLang === lang ? 'bg-primary text-white' : 'bg-card-light text-text-dim hover:text-white'"
          >
            {{ lang }}
          </button>
        </div>
        <div class="bg-card-light rounded-lg p-4 overflow-x-auto">
          <pre class="text-sm text-green-400 font-mono whitespace-pre">{{ codeSamples[activeLang] }}</pre>
        </div>
      </div>

      <!-- 错误码 -->
      <div class="card p-8">
        <h3 class="text-lg font-bold text-white mb-6">错误码</h3>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-text-dim border-b border-white/10">
              <th class="text-left pb-3 font-medium">Code</th>
              <th class="text-left pb-3 font-medium">说明</th>
            </tr>
          </thead>
          <tbody class="text-text-dim">
            <tr v-for="err in errors" :key="err.code" class="border-b border-white/5">
              <td class="py-3 font-mono text-red-400">{{ err.code }}</td>
              <td class="py-3">{{ err.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const activeLang = ref('cURL')

const endpoints = [
  { path: 'POST /v1/images/generations', desc: '生成图片（文生图 / 图生图）' },
  { path: 'GET /v1/models', desc: '获取可用模型列表' },
  { path: 'GET /v1/images/history', desc: '获取生图历史记录' }
]

const codeSamples: Record<string, string> = {
  cURL: `curl https://your-domain.com/v1/images/generations \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"dall-e-3","prompt":"a cute cat","n":1,"size":"1024x1024"}'`,

  JavaScript: `const response = await fetch('/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'dall-e-3',
    prompt: 'a cute cat',
    n: 1,
    size: '1024x1024'
  })
})
const data = await response.json()
console.log(data.data[0].url)`,

  Python: `import requests

resp = requests.post(
    'https://your-domain.com/v1/images/generations',
    headers={'Authorization': f'Bearer {token}'},
    json={'model': 'dall-e-3', 'prompt': 'a cute cat', 'n': 1, 'size': '1024x1024'}
)
print(resp.json()['data'][0]['url'])`
}

const errors = [
  { code: 400, desc: '请求参数错误' },
  { code: 401, desc: '未授权，API Token 无效或已过期' },
  { code: 402, desc: '积分不足，请充值' },
  { code: 429, desc: '请求过于频繁，请稍后重试' },
  { code: 500, desc: '服务端错误，请联系客服' }
]
</script>