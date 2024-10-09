# 使用 Node.js 作为基础镜像
FROM node:20.11-alpine3.19 AS base
LABEL maintainer="zederer@aquaintelling.com"

# 设置工作目录
WORKDIR /app/graphrag-visualizer

# 复制依赖文件
COPY package.json package-lock.json ./

# 安装依赖
RUN npm install

# 复制其余源代码
COPY . .

# 暴露应用运行的端口
EXPOSE 3004

# 启动应用
CMD ["npm", "start"]
