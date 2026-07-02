<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex items-center gap-4 mb-8">
      <h1 class="text-2xl font-bold text-gray-800">AI 创作</h1>
      <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button class="px-4 py-1.5 text-sm font-medium bg-white text-primary-600 rounded-md shadow-sm">文生图</button>
        <button class="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md transition-colors">图生图</button>
      </div>
    </div>

    <div class="flex gap-6">
      <!-- Left Panel: Parameters -->
      <div class="w-80 shrink-0 space-y-5">
        <div class="card p-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">提示词</label>
          <textarea
            class="input-field min-h-[120px] resize-y"
            placeholder="描述你想要生成的图片..."
          ></textarea>
          <div class="flex flex-wrap gap-2 mt-3">
            <span class="chip">一只可爱的猫</span>
            <span class="chip">赛博朋克城市</span>
            <span class="chip">山水国画</span>
          </div>
        </div>

        <div class="card p-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">模型</label>
          <div class="flex flex-wrap gap-2">
            <span class="chip chip-active">GPT Image 2</span>
            <span class="chip">DALL-E 3</span>
            <span class="chip">Imagen 3</span>
          </div>
        </div>

        <div class="card p-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">尺寸</label>
          <div class="flex flex-wrap gap-2">
            <span class="chip chip-active">1:1</span>
            <span class="chip">16:9</span>
            <span class="chip">9:16</span>
          </div>
        </div>

        <button class="btn-primary w-full">开始生成</button>
      </div>

      <!-- Right Panel: Results -->
      <div class="flex-1">
        <div class="card p-12 text-center">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p class="text-gray-500">输入提示词，点击生成</p>
          <p class="text-sm text-gray-400 mt-1">支持多种模型和风格选择</p>
        </div>
      </div>
    </div>
  </div>
</template>
