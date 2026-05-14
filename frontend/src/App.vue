<template>
  <div class="app">
    <header class="app-header">
      <h1>双色球中奖检查器</h1>
      <LoginPanel />
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import LoginPanel from './components/LoginPanel.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}
</style>
