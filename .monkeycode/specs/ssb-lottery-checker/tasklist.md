# 需求实施计划

- [ ] 1. 初始化项目结构
  - 创建前端项目 `frontend/`，使用 Vite + Vue 3 模板
  - 创建后端项目 `backend/`，使用 Express + SQLite
  - 配置前端 Vite 代理 `/api` 到后端 `http://localhost:3001`
  - 配置 `allowedHosts: ['.monkeycode-ai.online']`
  - 安装依赖：后端 (express, better-sqlite3, jsonwebtoken, cors, axios)，前端 (vue, vue-router, axios, pinia)

- [ ] 2. 实现后端数据模型和数据库
  - [ ] 2.1 创建 SQLite 数据库初始化脚本 `backend/db/init.js`
    - 创建 User 表 (id, openId, nickname, avatar, token, tokenExpiry, createdAt, updatedAt)
    - 创建 UserNumber 表 (id, userId, redBalls, blueBall, createdAt)
    - 创建 LotteryPeriod 表 (period, redBalls, blueBall, drawDate, fetchedAt)
  - [ ] 2.2 创建数据库连接模块 `backend/db/connection.js`
    - 封装 better-sqlite3 连接
    - 提供事务支持

- [ ] 3. 实现后端中奖判定逻辑
  - [ ] 3.1 创建中奖规则模块 `backend/services/prizeRules.js`
    - 实现红球匹配数 + 蓝球匹配数判定中奖等级函数
    - 一等奖: 6红+1蓝, 二等奖: 6红+0蓝, 三等奖: 5红+1蓝, 四等奖: 5红+0蓝或4红+1蓝, 五等奖: 4红+0蓝或3红+1蓝, 六等奖: 2红+1蓝或1红+1蓝或0红+1蓝
  - [ ] 3.2 创建比对服务 `backend/services/compareService.js`
    - 接收用户号码组和开奖数据，返回每组号码每期的中奖结果

- [ ] 4. 实现后端开奖数据代理
  - [ ] 4.1 创建开奖数据服务 `backend/services/lotteryService.js`
    - 实现获取近20期开奖数据的函数
    - 优先从 LotteryPeriod 缓存读取
    - 缓存过期时调用外部 API 获取并更新缓存
  - [ ] 4.2 创建 API 代理路由 `backend/routes/lottery.js`
    - GET /api/lottery/recent 返回近20期数据

- [ ] 5. 实现后端用户认证（模拟微信扫码）
  - [ ] 5.1 创建认证服务 `backend/services/authService.js`
    - 生成场景码 sceneStr
    - 模拟扫码流程：轮询接口返回 pending -> scanned -> success
    - 生成 JWT token
  - [ ] 5.2 创建认证路由 `backend/routes/auth.js`
    - POST /api/auth/qrcode 返回模拟二维码URL和sceneStr
    - GET /api/auth/status?sceneStr=xxx 返回登录状态
    - POST /api/auth/logout 清除token
  - [ ] 5.3 创建 Token 验证中间件 `backend/middleware/auth.js`
    - 验证 JWT token 有效性
    - 从请求中提取用户信息

- [ ] 6. 实现后端号码组 CRUD
  - [ ] 6.1 创建号码路由 `backend/routes/numbers.js`
    - GET /api/numbers 获取用户已保存号码（需认证）
    - POST /api/numbers 保存号码组（需认证）
    - DELETE /api/numbers/:id 删除号码组（需认证）

- [ ] 7. 创建后端入口
  - [ ] 7.1 创建 `backend/server.js`
    - 初始化 Express 应用
    - 挂载所有路由
    - 初始化数据库
    - 监听端口 3001

- [ ] 8. 检查点 - 确保后端服务可启动，API 可调用

- [ ] 9. 实现前端项目基础结构
  - [ ] 9.1 创建 Vue 3 项目基础结构
    - 配置 Vite、Vue Router、Pinia
    - 创建基础布局组件 App.vue
    - 配置全局样式
  - [ ] 9.2 创建 API 请求模块 `frontend/src/api/index.js`
    - 封装 axios 实例，设置 baseURL
    - 封装 lottery、auth、numbers 接口调用函数

- [ ] 10. 实现前端号码输入组件
  - [ ] 10.1 创建 `frontend/src/components/NumberInput.vue`
    - 每组包含6个红球输入 + 1个蓝球输入
    - 最多支持10组号码
    - 添加/删除号码组按钮
  - [ ] 10.2 实现号码校验逻辑
    - 红球: 1-33 不重复
    - 蓝球: 1-16
    - 实时校验并显示错误提示

- [ ] 11. 实现前端登录组件
  - [ ] 11.1 创建 `frontend/src/components/LoginPanel.vue`
    - 未登录状态：显示"微信扫码登录"按钮（模拟流程）
    - 登录中状态：显示模拟二维码，轮询登录状态
    - 已登录状态：显示用户昵称和头像，退出按钮
  - [ ] 11.2 创建用户状态 Store `frontend/src/stores/user.js`
    - 管理登录状态、token、用户信息
    - 提供 login、logout、checkStatus 方法

- [ ] 12. 实现前端号码保存组件
  - [ ] 12.1 创建 `frontend/src/components/SavedNumbers.vue`
    - 展示已保存的号码组列表
    - 加载/删除操作
    - 仅登录用户可见
  - [ ] 12.2 创建号码状态 Store `frontend/src/stores/numbers.js`
    - 管理当前输入的号码组
    - 提供保存、加载、删除方法

- [ ] 13. 实现前端结果展示组件
  - [ ] 13.1 创建 `frontend/src/components/ResultDisplay.vue`
    - 表格展示：行=号码组，列=期号
    - 单元格显示中奖等级和奖金，未中奖项显示"未中奖"
    - 页面顶部汇总：总中奖次数、总奖金
  - [ ] 13.2 创建结果状态 Store `frontend/src/stores/result.js`
    - 管理比对结果数据
    - 提供提交比对、重置方法

- [ ] 14. 创建前端主页面
  - [ ] 14.1 创建 `frontend/src/views/Home.vue`
    - 组合所有组件：登录面板、号码输入、保存号码、提交按钮、结果展示
    - 响应式布局适配移动端
  - [ ] 14.2 配置路由 `frontend/src/router/index.js`
    - 首页路由 /

- [ ] 15. 检查点 - 确保前端可启动，完整流程可运行（输入号码 -> 提交 -> 展示结果）
