<template>
  <div class="min-h-screen bg-dark flex flex-col">
    <AppHeader />
    <main class="flex-1 flex">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>