<template>
  <div class="app">
    <header class="app-header">
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
  background: white;
  padding: 8px 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.app-main {
  padding: 16px;
}
</style>
