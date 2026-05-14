# 需求实施计划

- [x] 1. 初始化项目结构
  - 创建前端项目 `frontend/`，使用 Vite + Vue 3 模板
  - 创建后端项目 `backend/`，使用 Express + SQLite
  - 配置前端 Vite 代理 `/api` 到后端 `http://localhost:3001`
  - 配置 `allowedHosts: ['.monkeycode-ai.online']`
  - 安装依赖：后端 (express, better-sqlite3, jsonwebtoken, cors, axios)，前端 (vue, vue-router, axios, pinia)

- [x] 2. 实现后端数据模型和数据库
  - [x] 2.1 创建 SQLite 数据库初始化脚本 `backend/db/init.js`
  - [x] 2.2 创建数据库连接模块 `backend/db/connection.js`
    - 封装 better-sqlite3 连接
    - 提供事务支持

- [x] 3. 实现后端中奖判定逻辑
  - [x] 3.1 创建中奖规则模块 `backend/services/prizeRules.js`
  - [x] 3.2 创建比对服务 `backend/services/compareService.js`
    - 接收用户号码组和开奖数据，返回每组号码每期的中奖结果

- [x] 4. 实现后端开奖数据代理
  - [x] 4.1 创建开奖数据服务 `backend/services/lotteryService.js`
  - [x] 4.2 创建 API 代理路由 `backend/routes/lottery.js`
    - GET /api/lottery/recent 返回近20期数据

- [x] 5. 实现后端用户认证（模拟微信扫码）
  - [x] 5.1 创建认证服务 `backend/services/authService.js`
  - [x] 5.2 创建认证路由 `backend/routes/auth.js`
  - [x] 5.3 创建 Token 验证中间件 `backend/middleware/auth.js`
    - 验证 JWT token 有效性
    - 从请求中提取用户信息

- [x] 6. 实现后端号码组 CRUD
  - [x] 6.1 创建号码路由 `backend/routes/numbers.js`
    - GET /api/numbers 获取用户已保存号码（需认证）
    - POST /api/numbers 保存号码组（需认证）
    - DELETE /api/numbers/:id 删除号码组（需认证）

- [x] 7. 创建后端入口
  - [x] 7.1 创建 `backend/server.js`

- [x] 8. 检查点 - 确保后端服务可启动，API 可调用

- [x] 9. 实现前端项目基础结构
  - [x] 9.1 创建 Vue 3 项目基础结构
  - [x] 9.2 创建 API 请求模块 `frontend/src/api/index.js`

- [x] 10. 实现前端号码输入组件
  - [x] 10.1 创建 `frontend/src/components/NumberInput.vue`
  - [x] 10.2 实现号码校验逻辑

- [x] 11. 实现前端登录组件
  - [x] 11.1 创建 `frontend/src/components/LoginPanel.vue`
  - [x] 11.2 创建用户状态 Store `frontend/src/stores/user.js`

- [x] 12. 实现前端号码保存组件
  - [x] 12.1 创建 `frontend/src/components/SavedNumbers.vue`
  - [x] 12.2 创建号码状态 Store `frontend/src/stores/numbers.js`

- [x] 13. 实现前端结果展示组件
  - [x] 13.1 创建 `frontend/src/components/ResultDisplay.vue`
  - [x] 13.2 创建结果状态 Store `frontend/src/stores/result.js`

- [x] 14. 创建前端主页面
  - [x] 14.1 创建 `frontend/src/views/Home.vue`
  - [x] 14.2 配置路由 `frontend/src/router/index.js`

- [x] 15. 检查点 - 确保前端可启动，完整流程可运行（输入号码 -> 提交 -> 展示结果）
