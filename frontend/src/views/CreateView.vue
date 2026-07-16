<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Header + Tabs -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-800">AI 创作</h1>
      <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          @click="mode = 'text2image'"
          class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
          :class="mode === 'text2image' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >文生图</button>
        <button
          @click="mode = 'image2image'"
          class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
          :class="mode === 'image2image' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        >图生图</button>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left Panel: Parameters (320px fixed) -->
      <div class="w-full lg:w-80 shrink-0 space-y-4">
        <!-- Prompt -->
        <div class="card p-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">提示词</label>
          <textarea
            v-model="prompt"
            class="input-field min-h-[110px] resize-y !text-sm"
            placeholder="描述你想要生成的图片，越详细效果越好..."
            rows="4"
          ></textarea>
          <div class="flex flex-wrap gap-2 mt-3">
            <button
              v-for="p in presets"
              :key="p"
              @click="prompt = p"
              class="chip"
            >{{ p }}</button>
          </div>
        </div>

        <!-- Image Upload (image2image only) -->
        <div v-if="mode === 'image2image'" class="card p-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">参考图片</label>
          <div
            class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
            :class="isDragging ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerUpload"
          >
            <input ref="uploadInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
            <div v-if="!referenceImage">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p class="text-sm text-gray-500">拖拽或点击上传参考图</p>
              <p class="text-xs text-gray-400 mt-1">PNG / JPG / WEBP，最大 10MB</p>
            </div>
            <div v-else class="relative">
              <img :src="referencePreview" class="max-h-48 mx-auto rounded-lg" />
              <button @click.stop="clearReference" class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Model -->
        <div class="card p-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">模型</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="m in models"
              :key="m.id"
              @click="selectedModel = m.id"
              class="chip"
              :class="{ 'chip-active': selectedModel === m.id }"
            >{{ m.label }}</button>
          </div>
        </div>

        <!-- Style -->
        <div class="card p-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">风格</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="s in styles"
              :key="s"
              @click="selectedStyle = selectedStyle === s ? '' : s"
              class="chip"
              :class="{ 'chip-active': selectedStyle === s }"
            >{{ s }}</button>
          </div>
        </div>

        <!-- Size -->
        <div class="card p-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">尺寸</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="sz in sizes"
              :key="sz.value"
              @click="selectedSize = sz.value"
              class="chip"
              :class="{ 'chip-active': selectedSize === sz.value }"
            >{{ sz.label }}</button>
          </div>
        </div>

        <!-- Count -->
        <div class="card p-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">数量</label>
          <div class="flex gap-2">
            <button
              v-for="c in counts"
              :key="c"
              @click="selectedCount = c"
              class="chip flex-1 text-center"
              :class="{ 'chip-active': selectedCount === c }"
            >{{ c }} 张</button>
          </div>
        </div>

        <!-- Cost + Generate -->
        <div class="card p-5">
          <div class="flex items-center justify-between text-sm mb-4">
            <span class="text-gray-500">预计消耗</span>
            <span class="font-semibold text-gray-700">{{ selectedCount }} 积分</span>
          </div>
          <div class="flex items-center justify-between text-sm mb-4">
            <span class="text-gray-500">当前余额</span>
            <span class="font-medium" :class="balanceNum < selectedCount ? 'text-red-500' : 'text-gray-700'">
              {{ formatBalance(auth.balance) }}
            </span>
          </div>
          <button
            @click="handleGenerate"
            :disabled="generating || !prompt.trim() || balanceNum < selectedCount"
            class="btn-primary w-full flex items-center justify-center gap-2"
          >
            <svg v-if="generating" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ generating ? '生成中...' : '开始生成' }}
          </button>
          <p v-if="balanceNum < selectedCount" class="text-xs text-red-500 text-center mt-2">
            余额不足，请 <RouterLink to="/console/billing" class="underline font-medium">充值</RouterLink>
          </p>
        </div>
      </div>

      <!-- Right Panel: Results -->
      <div class="flex-1 min-w-0">
        <!-- Error message -->
        <Transition name="fade">
          <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <div class="flex-1">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
            <button @click="error = ''" class="text-red-400 hover:text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </Transition>

        <!-- Empty State -->
        <div v-if="images.length === 0 && !generating" class="card p-16 text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p class="text-gray-500 text-lg font-medium">输入提示词，开始创作</p>
          <p class="text-sm text-gray-400 mt-1">支持多种模型和风格选择，通常 10 秒内出图</p>
        </div>

        <!-- Results Grid -->
        <div v-else>
          <ImagePreview
            :images="images"
            :loading="generating"
            :cols="2"
            @variation="handleVariation"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { imagesApi } from '@/api/images'
import { generateImageViaMiniMax, sizeToAspectRatio } from '@/api/minimax'
import { formatBalance } from '@/utils/format'
import ImagePreview from '@/components/ImagePreview.vue'

const route = useRoute()
const auth = useAuthStore()

// --- State ---
const mode = ref<'text2image' | 'image2image'>('text2image')
const prompt = ref('')
const selectedModel = ref('gpt-image-1')
const selectedStyle = ref('')
const selectedSize = ref('1024x1024')
const selectedCount = ref(1)
const generating = ref(false)
const images = ref<Array<{ url: string }>>([])
const error = ref('')
const referenceImage = ref('')
const referencePreview = ref('')
const isDragging = ref(false)
const uploadInput = ref<HTMLInputElement>()

// --- Constants ---
const presets = [
  '一只可爱的橘猫趴在窗台上晒太阳',
  '赛博朋克风格的未来城市夜景，霓虹灯闪烁',
  '中国水墨画风格的山水风景，留白意境',
  '专业产品摄影，白色背景，柔和布光',
  '吉卜力风格的魔法森林，光斑洒落',
  '复古胶片感的街头摄影，雨天倒影',
]

const models = [
  { id: 'gpt-image-1', label: 'GPT Image 2' },
  { id: 'dall-e-3', label: 'DALL-E 3' },
  { id: 'imagen-3', label: 'Imagen 3' },
  { id: 'image-01', label: 'MiniMax 图生图' },
  { id: 'MiniMax-M3', label: 'MiniMax M3 (文本)' },
]

const styles = ['写实', '动漫', '插画', '油画', '水彩', '极简', '摄影']

const styleSuffix: Record<string, string> = {
  '写实': ', photorealistic, 8K, high detail, DSLR quality',
  '动漫': ', anime style, cel shading, vibrant colors',
  '插画': ', digital illustration, detailed artwork',
  '油画': ', oil painting style, canvas texture, rich brushstrokes',
  '水彩': ', watercolor painting, soft washes, delicate details',
  '极简': ', minimalist design, clean lines, simple composition',
  '摄影': ', professional photography, natural lighting, bokeh',
}

const sizes = [
  { label: '1:1', value: '1024x1024' },
  { label: '16:9', value: '1792x1024' },
  { label: '9:16', value: '1024x1792' },
]

const counts = [1, 2, 4]

const balanceNum = computed(() => (auth.balance ?? 0) / 500000)


// --- Query param support (from gallery) ---
onMounted(() => {
  const qp = route.query.prompt
  if (qp && typeof qp === 'string') {
    prompt.value = qp
  }
  auth.fetchUser()
})

// --- Image Upload (image2image) ---
function triggerUpload() {
  uploadInput.value?.click()
}

function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) readImage(file)
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) readImage(file)
}

function readImage(file: File) {
  if (!file.type.startsWith('image/')) {
    error.value = '请上传图片文件（PNG/JPG/WEBP）'
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    error.value = '图片大小不能超过 10MB'
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    referencePreview.value = e.target?.result as string
    referenceImage.value = (e.target?.result as string).split(',')[1]
  }
  reader.onerror = () => {
    error.value = '图片读取失败，请重试'
  }
  reader.readAsDataURL(file)
}

function clearReference() {
  referenceImage.value = ''
  referencePreview.value = ''
  if (uploadInput.value) uploadInput.value.value = ''
}

// --- Generate ---
async function handleGenerate() {
  if (!prompt.value.trim()) {
    error.value = '请输入提示词'
    return
  }
  if (!auth.apiKey) {
    error.value = 'API Key 未就绪，请退出重新登录'
    return
  }
  if (balanceNum.value < selectedCount.value) {
    error.value = '余额不足'
    return
  }

  generating.value = true
  error.value = ''

  const finalPrompt = prompt.value + (styleSuffix[selectedStyle.value] || '')

  try {
    let newImages: Array<{ url: string }> = []

    if (selectedModel.value === 'image-01' || selectedModel.value === 'MiniMax-M3') {
      // Use MiniMax native image generation API (image-01 model)
      const mmResult = await generateImageViaMiniMax(auth.apiKey || '', {
        model: 'image-01',
        prompt: finalPrompt,
        aspectRatio: sizeToAspectRatio(selectedSize.value),
        responseFormat: 'base64',
      })
      if (!mmResult.success) {
        throw { response: { data: { error: { message: mmResult.error || 'MiniMax 图片生成失败' } } } }
      }
      if (mmResult.imageData) {
        newImages = [{ url: mmResult.imageData }]
      }
    } else {
      // Use standard OpenAI-compatible images API (via new-api relay)
      const res = await imagesApi.generate({
        model: selectedModel.value,
        prompt: finalPrompt,
        n: selectedCount.value,
        size: selectedSize.value,
        ...(mode.value === 'image2image' && referenceImage.value && { input_image: referenceImage.value }),
      })

      // new-api 返回格式: { data: [{ url: '...' }] } 或 { data: [{ b64_json: '...' }] }
      const results = res.data?.data || []
      newImages = results.map((item: any) => {
        if (item.url) return { url: item.url }
        if (item.b64_json) return { url: `data:image/png;base64,${item.b64_json}` }
        return null
      }).filter(Boolean)
    }

    images.value = [...newImages, ...images.value]

    // Refresh balance
    await auth.fetchUser()
  } catch (e: any) {
    const msg = e?.response?.data?.error?.message
      || e?.response?.data?.message
      || e?.response?.data?.error
      || e?.message
    if (e?.response?.status === 401) {
      error.value = 'API Key 失效，请退出重新登录'
    } else if (e?.response?.status === 400) {
      error.value = msg || '请求参数有误，请检查提示词'
    } else if (e?.code === 'ECONNABORTED' || e?.message?.includes('timeout')) {
      error.value = '生成超时，请稍后重试'
    } else {
      error.value = msg || '生成失败，请稍后重试'
    }
  } finally {
    generating.value = false
  }
}

// --- Variation ---
async function handleVariation(img: { url: string }) {
  prompt.value = `类似这张图片的风格，${prompt.value || '请生成变体'}`
  mode.value = 'image2image'
  referencePreview.value = img.url
  // Convert the image to base64 for input_image
  if (img.url.startsWith('data:')) {
    referenceImage.value = img.url.split(',')[1]
  } else {
    try {
      const res = await fetch(img.url)
      const blob = await res.blob()
      const reader = new FileReader()
      reader.onload = () => {
        referenceImage.value = (reader.result as string).split(',')[1]
      }
      reader.readAsDataURL(blob)
    } catch {
      referenceImage.value = ''
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
