<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-b from-primary-50 to-white py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span class="section-tag mb-4">Powered by GPT Image 2</span>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mt-4 leading-tight">
          AI 图片创作平台
        </h1>
        <p class="text-lg text-gray-500 mt-4 max-w-2xl mx-auto">
          基于 GPT Image 2、DALL-E 3、Imagen 3 等多模型，输入文字即可生成专业级图片。支持文生图、图生图，满足电商、设计、内容创作全场景需求。
        </p>
        <div class="flex gap-4 justify-center mt-8">
          <RouterLink to="/register" class="btn-primary px-8 py-3 text-base">开始创作</RouterLink>
          <RouterLink to="/gallery" class="btn-secondary px-8 py-3 text-base">浏览画廊</RouterLink>
        </div>
        <div class="flex items-center justify-center gap-8 mt-10 text-sm text-gray-500">
          <span><strong class="text-gray-700">11,600+</strong> 提示词</span>
          <span class="w-px h-4 bg-gray-300"></span>
          <span><strong class="text-gray-700">5+</strong> 模型</span>
          <span class="w-px h-4 bg-gray-300"></span>
          <span><strong class="text-gray-700">&lt;10s</strong> 生成</span>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 lg:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="section-tag">功能</span>
          <h2 class="text-3xl font-bold text-gray-800 mt-3">强大的 AI 创作能力</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="feat in features" :key="feat.title" class="card-hover p-6">
            <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
              <component :is="feat.icon" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ feat.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Gallery Preview -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-8">
          <div>
            <span class="section-tag">画廊</span>
            <h2 class="text-3xl font-bold text-gray-800 mt-3">精选提示词</h2>
          </div>
          <RouterLink to="/gallery" class="text-primary-600 hover:text-primary-700 font-medium text-sm">
            查看更多 &rarr;
          </RouterLink>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="item in featuredPrompts"
            :key="item.id"
            class="card-hover overflow-hidden group cursor-pointer"
            @click="handleFeaturedClick(item)"
          >
            <div class="aspect-square flex items-center justify-center text-5xl relative overflow-hidden" :style="`background: linear-gradient(135deg, ${getGradient(item.id)})`">
              <span class="opacity-60 group-hover:opacity-100 transition-opacity">
                {{ getEmoji(item) }}
              </span>
            </div>
            <div class="p-4">
              <h4 class="text-sm font-semibold text-gray-700">{{ item.title }}</h4>
              <p class="text-xs text-gray-400 mt-1 line-clamp-2">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Preview -->
    <section class="py-16 lg:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="section-tag">定价</span>
          <h2 class="text-3xl font-bold text-gray-800 mt-3">简单透明的定价</h2>
          <p class="text-gray-500 mt-2">按需购买，无隐藏费用</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <p class="text-sm text-gray-500 mb-1">{{ plan.credits }} 积分</p>
            <p class="text-xs text-gray-400 mb-6">约 &yen;{{ plan.perImage }}/张</p>
            <RouterLink to="/register" :class="plan.popular ? 'btn-primary' : 'btn-secondary'" class="block text-center text-sm">
              开始使用
            </RouterLink>
          </div>
        </div>
        <div class="text-center mt-8">
          <RouterLink to="/pricing" class="text-primary-600 hover:text-primary-700 font-medium text-sm">
            查看完整定价 &rarr;
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-10 lg:p-14 text-center text-white shadow-glow">
          <h2 class="text-3xl font-bold mb-3">开始你的 AI 创作之旅</h2>
          <p class="text-primary-100 mb-8">免费注册即获得 10 积分，体验强大的 AI 生图能力</p>
          <RouterLink to="/register" class="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors shadow-lg">
            免费注册
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Argument Dialog for Featured Prompts -->
    <Teleport to="body">
      <div
        v-if="dialogPrompt"
        class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="dialogPrompt = null"
      >
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-1">{{ dialogPrompt.title }}</h3>
          <p class="text-sm text-gray-500 mb-5">{{ dialogPrompt.description }}</p>

          <div class="space-y-4 mb-6">
            <div v-for="arg in dialogPrompt.arguments" :key="arg.name">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ arg.label }}</label>
              <input
                v-model="dialogValues[arg.name]"
                :placeholder="arg.default"
                class="input-field"
              />
            </div>
          </div>

          <div class="flex gap-3">
            <button @click="dialogPrompt = null" class="btn-ghost flex-1">取消</button>
            <button @click="goToCreateFromDialog" class="btn-primary flex-1">去生成</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { h, computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { galleryApi, type PromptItem } from '@/api/gallery'
import { getGradient, getEmoji, replaceArguments } from '@/utils/promptHelpers'

const router = useRouter()
const featuredPrompts = computed(() => galleryApi.getFeatured().slice(0, 4))

const dialogPrompt = ref<PromptItem | null>(null)
const dialogValues = ref<Record<string, string>>({})

function handleFeaturedClick(item: PromptItem) {
  if (item.arguments.length > 0) {
    dialogPrompt.value = item
    const vals: Record<string, string> = {}
    item.arguments.forEach(a => { vals[a.name] = a.default })
    dialogValues.value = vals
  } else {
    router.push({ name: 'create', query: { prompt: item.content } })
  }
}

function goToCreateFromDialog() {
  if (!dialogPrompt.value) return
  const finalContent = replaceArguments(dialogPrompt.value.content, dialogValues.value)
  dialogPrompt.value = null
  router.push({ name: 'create', query: { prompt: finalContent } })
}

// SVG icon helpers
function svgIcon(paths: any[]) {
  return h('svg', { xmlns: 'http://www.w3.org/2000/svg', class: 'w-6 h-6 text-primary-500', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, paths)
}

const TextIcon = svgIcon([
  h('path', { d: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' }),
])
const ImageIcon = svgIcon([
  h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
  h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
  h('polyline', { points: '21 15 16 10 5 21' }),
])
const ModelIcon = svgIcon([
  h('rect', { x: '3', y: '3', width: '7', height: '7' }),
  h('rect', { x: '14', y: '3', width: '7', height: '7' }),
  h('rect', { x: '14', y: '14', width: '7', height: '7' }),
  h('rect', { x: '3', y: '14', width: '7', height: '7' }),
])
const PromptIcon = svgIcon([
  h('path', { d: 'M4 19.5A2.5 2.5 0 016.5 17H20' }),
  h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z' }),
])
const ApiIcon = svgIcon([
  h('polyline', { points: '16 18 22 12 16 6' }),
  h('polyline', { points: '8 6 2 12 8 18' }),
])
const SpeedIcon = svgIcon([
  h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }),
])

const features = [
  { title: '文生图', desc: '输入文字描述，AI 在几秒内生成专业图片，精准匹配你的创意。', icon: TextIcon },
  { title: '图生图', desc: '上传参考图，AI 融合已有风格再创作，激发无限灵感。', icon: ImageIcon },
  { title: '多模型支持', desc: 'GPT Image 2、DALL-E 3、Imagen 3 等多种模型，满足不同需求。', icon: ModelIcon },
  { title: '提示词库', desc: '11,600+ 精选提示词，覆盖 41 个分类，一键套用快速出图。', icon: PromptIcon },
  { title: 'API 接入', desc: '开放 OpenAI 兼容 API，开发者可轻松集成到自有产品。', icon: ApiIcon },
  { title: '极速生成', desc: '平均 10 秒内出图，支持批量生成，高效满足创作需求。', icon: SpeedIcon },
]

const plans = [
  { name: '体验包', price: '19.9', credits: 50, perImage: '0.40', popular: false },
  { name: '标准包', price: '49.9', credits: 150, perImage: '0.33', popular: true },
  { name: '专业包', price: '99.9', credits: 400, perImage: '0.25', popular: false },
  { name: '企业包', price: '299.9', credits: 1500, perImage: '0.20', popular: false },
]
</script>
