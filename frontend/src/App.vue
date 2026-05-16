<template>
  <div class="app">
    <header class="app-header">
      <div class="header-inner">
        <span class="header-brand">双色球</span>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #eef1f5 100%);
}

.app-header {
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
  box-shadow: 0 2px 12px rgba(229, 57, 53, 0.2);
}

.header-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-brand {
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: 2px;
}

.app-main {
  padding: 8px 16px 32px;
}
</style>
