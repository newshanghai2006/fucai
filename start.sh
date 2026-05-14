#!/bin/bash
# 启动双色球中奖检查器

# 启动后端服务
cd backend && node server.js &
BACKEND_PID=$!

# 启动前端服务
cd frontend && npm run dev

# 清理
trap "kill $BACKEND_PID 2>/dev/null" EXIT
